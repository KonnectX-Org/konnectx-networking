import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/appError";
import { UserModel } from "../../user/models/userModel";
import mongoose from "mongoose";
import { FriendRequestModel } from "../models/friendReqModel";
import {  RequestStatusEnum } from "../types/friendManagementEnums";
import { NotificationEnum } from "../../notification/types/notificationEnums";
import { FriendModel } from "../models/friendModel";
import { imageUploader } from "../../../utils/imageUploader";
import { createNotification } from "../../notification/services/notificationService";
import { badgeLevels } from "../../../utils/badgeLevels";


// check 
// Video upload
// friend_req
// notification
export const sendFriendRequest = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const userId = req.user.id;
    const { data } = req.body;

    // if (!data.note && !req.file)
    //     throw new AppError("Either note or video, one is required", 400);

    if (!data.recieverId)
        throw new AppError("RecieverId required", 400);

    // receiver exists
    const senderPromise = UserModel.findById(new mongoose.Types.ObjectId(userId)).select("name");
    const receiverExistPromise = UserModel.exists({ _id: new mongoose.Types.ObjectId(String(data.recieverId)) });

    // freind request exist 
    const existingRequestPromise = FriendRequestModel.findOne({
        $or: [
            { sender: new mongoose.Types.ObjectId(userId), receiver: new mongoose.Types.ObjectId(String(data.recieverId)) },
            { sender: new mongoose.Types.ObjectId(String(data.recieverId)), receiver: new mongoose.Types.ObjectId(userId) }
        ],
    });

    const [sender, receiverExist, existingRequest] = await Promise.all([senderPromise, receiverExistPromise, existingRequestPromise]);
    if (!sender)
        throw new AppError("Reciever not found", 404);

    if (!receiverExist)
        throw new AppError("Reciever not found", 404);

    if (existingRequest)
        throw new AppError("Friend Request Already exist", 409);

    // uploading video
    let video;
    if (req.file) {
        const videoUrl = await imageUploader(req.file);
        if (!videoUrl)
            throw new AppError("Failed to upload video", 500);
        video = videoUrl;
    }

    // create friend request
    const newFriendRequested = await FriendRequestModel.create({
        sender: userId,
        receiver: data.recieverId,
        note: data.note ?? "",
        video: video ?? "",
        // sentAt: Date.now()
    });

    if (!newFriendRequested)
        throw new AppError("Failed to sent request, try again later", 500);

    const notificationData = {
        userId: data.recieverId,
        type: NotificationEnum.FRIEND_REQUEST_RECEIVED,
        message: `${sender.name} sent you a friend request`,
        reference: userId
    }
    await createNotification(notificationData);

    return res.status(200).json({
        success: true,
        newFriendRequested
    });
}


// checks 
// make friendreq
// make friend 
export const acceptRequestReceived = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const userId = req.user.id;
    const { senderId, status } = req.query;

    if (!senderId || !status)
        throw new AppError("SenderId is required", 400);

    if (![RequestStatusEnum.ACCEPTED, RequestStatusEnum.REJECTED].includes(status as RequestStatusEnum)) {
        throw new AppError("Invalid status provided", 400);
    }

    const user = await UserModel.findById(new mongoose.Types.ObjectId(userId)).select("name");
    if (!user)
        throw new AppError("Invalid request", 409);

    // Handle accept status by creating a new friend record and updating freind request model
    if (status === RequestStatusEnum.ACCEPTED) {
        const updateFriendRequest = await FriendRequestModel.findOneAndUpdate(
            {
                sender: new mongoose.Types.ObjectId(String(senderId)),
                receiver: new mongoose.Types.ObjectId(String(userId))
            },
            {
                $set: { status }
            },
            { new: true }
        );
        if (!updateFriendRequest)
            throw new AppError("Friend request not found", 404);

        const friend = await FriendModel.create({
            user1: new mongoose.Types.ObjectId(String(senderId)),
            user2: new mongoose.Types.ObjectId(String(userId))
        });

        if (!friend) throw new AppError("Failed to add friend", 500);

        const notificationData = {
            userId: String(senderId),
            type: NotificationEnum.FRIEND_REQUEST_ACCEPTED,
            message: `${user.name} accepted your friend request`,
            reference: userId
        }
        await createNotification(notificationData);

        return res.status(201).json({
            success: true,
            message: "Friend request accepted",
            friend
        });
    }

    // on rejectiion delete freind request
    const deleteFriendRequest = await FriendRequestModel.deleteOne({
        sender: new mongoose.Types.ObjectId(String(senderId)),
        receiver: new mongoose.Types.ObjectId(String(userId))
    });

    if (deleteFriendRequest.deletedCount === 0)
        throw new AppError("Friend request not found", 404);

    // Handle rejected status
    return res.status(200).json({
        success: true,
        message: "Request rejected successfully",
    });

}

export const getRequestSended = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const userId = req.user.id;

    const data = await FriendRequestModel.aggregate([
        {
            $match: {
                sender: new mongoose.Types.ObjectId(userId),
                status: RequestStatusEnum.PENDING
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "receiver",
                foreignField: "_id",
                as: "requestSentUser"
            }
        },
        {
            $unwind: "$requestSentUser"
        },
        {
            $project: {
                _id: 0,
                receiverId: "$requestSentUser._id",
                name: "$requestSentUser.name",
                email: "$requestSentUser.email",
                profileImage: "$requestSentUser.profileImage",
                profession: "$requestSentUser.profession",
                industry: "$requestSentUser.industry",
                company: "$requestSentUser.company",
                lookingFor: "$requestSentUser.lookingFor",
                interests: "$requestSentUser.interests",
                note: 1,
                video: 1,
                createdAt: 1
            }
        }
    ]);

    if (!data.length)
        return res.status(204).json({
            success: true,
            message: "Friend request sended not found"
        });

    return res.status(200).json({
        success: true,
        data
    })
}

export const getRequestRecieved = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const userId = req.user.id;

    const data = await FriendRequestModel.aggregate([
        {
            $match: {
                receiver: new mongoose.Types.ObjectId(userId),
                status: RequestStatusEnum.PENDING
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "requestRecievedUser"
            }
        },
        {
            $unwind: "$requestRecievedUser"
        },
        {
            $addFields: {
                priority: {
                    $cond: {
                        if: { $gt: [{ $strLenCP: "$video" }, 0] },
                        then: 2,
                        else: 0
                    }
                }
            }
        },
        {
            $sort: { priority: -1 }
        },
        {
            $project: {
                _id: 0,
                senderId: "$requestRecievedUser._id",
                name: "$requestRecievedUser.name",
                email: "$requestRecievedUser.email",
                interest: "$requestRecievedUser.interests",
                profileImage: "$requestRecievedUser.profileImage",
                profession: "$requestRecievedUser.profession",
                industry: "$requestRecievedUser.industry",
                company: "$requestRecievedUser.company",
                lookingFor: "$requestRecievedUser.lookingFor",
                note: 1,
                video: 1,
                createdAt: 1
            }
        }
    ]);

    if (!data.length)
        return res.status(204).json({
            success: true,
            message: "Friend recieved not found"
        });

    return res.status(200).json({
        success: true,
        data
    })
}

export const getAllFriends = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const userId = req.user.id;
    console.log("userID", userId);

    const friends = await FriendModel.aggregate([
        {
            $match: {
                $or: [
                    { user1: new mongoose.Types.ObjectId(userId) },
                    { user2: new mongoose.Types.ObjectId(userId) }
                ]
            }
        },
        {
            $project: {
                otherUserId: {
                    $cond: {
                        if: { $eq: ["$user1", new mongoose.Types.ObjectId(userId)] },
                        then: "$user2",
                        else: "$user1"
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                foreignField: "_id",
                localField: "otherUserId",
                as: "friends"
            }
        },
        {
            $unwind: "$friends"
        },
        {
            $project: {
                _id: 0,
                friendId: "$friends._id",
                name: "$friends.name",
                email: "$friends.email",
                contactNumber: "$friends.contactNumber",
                profileImage: "$friends.profileImage",
                profession: "$friends.profession",
                position: "$friends.position",
                industry: "$friends.industry",
                company: "$friends.company",
                lookingFor: "$friends.lookingFor",
                interests: "$friends.interests",
                otherUserId: 1,
                createdAt: "$friends.createdAt",
            }
        }
    ]);

    // console.log("Friends", friends);
    if (!friends.length)
        return res.status(204).send();

    return res.status(200).json({
        success: true,
        message: "Friends fetched successfully",
        friends
    })
}

export const unfollowFriend = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const userId = req.user.id;
    const { friendId } = req.query;

    if (!friendId)
        throw new AppError("freindId is required", 400);

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const deleteFriendRequestPromise = FriendRequestModel.deleteOne(
            {
                $or: [
                    {
                        sender: new mongoose.Types.ObjectId(userId),
                        receiver: new mongoose.Types.ObjectId(String(friendId))
                    },
                    {
                        sender: new mongoose.Types.ObjectId(String(friendId)),
                        receiver: new mongoose.Types.ObjectId(userId)
                    }
                ]
            },
            { session }
        );

        const deleteFriendPromise = FriendModel.deleteOne(
            {
                $or: [
                    {
                        user1: new mongoose.Types.ObjectId(userId),
                        user2: new mongoose.Types.ObjectId(String(friendId))
                    },
                    {
                        user1: new mongoose.Types.ObjectId(String(friendId)),
                        user2: new mongoose.Types.ObjectId(userId)
                    }
                ]
            },
            { session }
        );

        const [deleteFriendRequest, deleteFriend] = await Promise.all([deleteFriendRequestPromise, deleteFriendPromise]);

        if (deleteFriendRequest.deletedCount > 0 && deleteFriend.deletedCount > 0) {
            await session.commitTransaction();
            return res.status(200).json({
                success: true,
                message: "Unfollowed successfully."
            });
        } else {
            throw new Error('One of the operations failed, rolling back');
        }
    }
    catch (error) {
        await session.abortTransaction();
        // console.error('Transaction failed and was rolled back:', error);
        throw new AppError("Failed to unfollow Friend", 500);
    } finally {
        session.endSession();
    }
}

export const withdrawFriendRequest = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {
    const userId = req.user.id;
    const { receiverId } = req.query;

    if (!receiverId)
        throw new AppError("Receiver is required", 400);

    const deleteRequest = await FriendRequestModel.deleteOne({
        receiver: new mongoose.Types.ObjectId(String(receiverId)),
        sender: new mongoose.Types.ObjectId(userId)
    });

    if (!deleteRequest)
        throw new AppError("Receiver not found", 404);

    return res.status(200).json({
        success: true,
        message: "Request withdrawn successfully"
    });
}

export const friendProfileById = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const userId = req.user.id;
    const { friendId } = req.query;

    const friendProfile = await FriendModel.aggregate([
        {
            $match: {
                $or: [
                    {
                        user1: new mongoose.Types.ObjectId(userId),
                        user2: new mongoose.Types.ObjectId(String(friendId))
                    },
                    {
                        user1: new mongoose.Types.ObjectId(String(friendId)),
                        user2: new mongoose.Types.ObjectId(userId)
                    },
                ]
            }
        },
        {
            $project: {
                friendId: {
                    $cond: {
                        if: { $eq: ["$user1", new mongoose.Types.ObjectId(userId)] },
                        then: "$user2",
                        else: "$user1"
                    }
                }
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "friendId",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                _id: 0,
                friendId: "$user._id",
                name: "$user.name",
                email: "$user.email",
                contactNumber: "$user.contactNumber",
                profileImage: "$user.profileImage",
                profession: "$user.profession",
                position: "$user.position",
                industry: "$user.industry",
                company: "$user.company",
                instituteName: "$user.instituteName",
                courseName: "$user.courseName",
                lookingFor: "$user.lookingFor",
                interests: "$user.interests",
                previousBadgeName: "$user.previousBadgeName"
            },
        },
        {
            $addFields: {
                isConnected: true,
                level: {
                    $cond: {
                        if: { eq: ["$previousBadgeName", "Parmanu"] },
                        then: 1,
                        else: {
                            if: { eq: ["$previousBadgeName", "Nakshatra"] },
                            then: 2,
                            else: {
                                if: { eq: ["$previousBadgeName", "Chandra"] },
                                then: 3,
                                else: {
                                    if: { eq: ["$previousBadgeName", "Shani"] },
                                    then: 4,
                                    else: 5
                                }
                            }
                        }
                    }
                }
            }
        }
    ]);

    if (!friendProfile.length) {

        const userProfile = await UserModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(String(friendId)) },
            },
            {
                $project: {
                    friendId: "$_id",
                    name: 1,
                    profileImage: 1,
                    profession: 1,
                    position: 1,
                    industry: 1,
                    company: 1,
                    instituteName: 1,
                    courseName: 1,
                    lookingFor: 1,
                    interests: 1,
                }
            },
            {
                $addFields: {
                    isConnected: false
                }
            }
        ]);

        if (!userProfile.length)
            throw new AppError("Firend not found", 404);
        return res.status(200).json({
            success: true,
            friendProfile: userProfile
        });
    }

    return res.status(200).json({
        success: true,
        friendProfile
    });
}

export const addFriendDirect = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const userId = req.user.id;
    const { friendId } = req.query;

    if (!friendId)
        throw new AppError("FriendId not found", 400);

    const [userDetails, friendDetails] = await Promise.all([
        UserModel.findById(new mongoose.Types.ObjectId(userId)).select("name"),
        UserModel.findById(new mongoose.Types.ObjectId(String(friendId))).select("name")
    ])

    if (!userDetails) throw new AppError("User details not found", 401);
    if (!friendDetails) throw new AppError("Friend not found", 400);

    const existingFriendship = await FriendModel.findOne({
        $or: [
            {
                user1: new mongoose.Types.ObjectId(userId),
                user2: new mongoose.Types.ObjectId(String(friendId))
            },
            {
                user1: new mongoose.Types.ObjectId(String(friendId)),
                user2: new mongoose.Types.ObjectId(userId)
            }
        ]
    });
    if (existingFriendship)
        throw new AppError("Friendship already exists", 409);

    // checking either request earlier made or not, if made the update status to accepted
    const existingRequestPromise = await FriendRequestModel.findOne({
        $or: [
            { sender: new mongoose.Types.ObjectId(userId), receiver: new mongoose.Types.ObjectId(String(friendId)) },
            { sender: new mongoose.Types.ObjectId(String(friendId)), receiver: new mongoose.Types.ObjectId(userId) }
        ],
    });

    if (existingRequestPromise) {
        existingRequestPromise.status = RequestStatusEnum.ACCEPTED
        await existingRequestPromise.save();
    }
    else {
        const newFriendRequested = await FriendRequestModel.create({
            sender: userId,
            receiver: friendId,
            note: "",
            video: "",
            status: RequestStatusEnum.ACCEPTED
        });

        console.log("newFriendRequested", newFriendRequested)
    }

    const friend = await FriendModel.create({
        user1: new mongoose.Types.ObjectId(userId),
        user2: new mongoose.Types.ObjectId(String(friendId))
    });

    if (!friend)
        throw new AppError("Failed to add as friend", 500);

    const userNotificationData = {
        userId: userId,
        type: NotificationEnum.FRIEND_ADDED_DIRECTLY,
        message: `You and ${friendDetails.name} are now friends by scanning a QR code.`,
        reference: String(friendId)
    }

    const friendNotificationData = {
        userId: String(friendId),
        type: NotificationEnum.FRIEND_ADDED_DIRECTLY,
        message: `You and ${userDetails.name} are now friends by scanning a QR code.`,
        reference: userId
    }

    const [userNotification, friendNotification] = await Promise.all([
        createNotification(userNotificationData),
        createNotification(friendNotificationData)
    ]);

    return res.status(200).json({
        success: true,
        message: "Friend added successfully"
    })
}

export const userProfileById = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const userId = req.user.id;
    const { friendId } = req.query;

    if (!friendId)
        throw new AppError("Field not found", 400);


    const friendProfile = await FriendRequestModel.aggregate([
        {
            $match: {
                $or: [
                    {
                        sender: new mongoose.Types.ObjectId(userId),
                        receiver: new mongoose.Types.ObjectId(String(friendId))
                    },
                    {
                        sender: new mongoose.Types.ObjectId(String(friendId)),
                        receiver: new mongoose.Types.ObjectId(userId)
                    }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                friendId: {
                    $cond: {
                        if: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
                        then: "$receiver",
                        else: "$sender"
                    }
                },
                friendShipStatus: {
                    $cond: {
                        if: { $eq: ["$status", RequestStatusEnum.PENDING] },
                        then: {
                            $cond: {
                                if: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
                                then: "REQUEST_SENT",
                                else: "REQUEST_RECEIVED"
                            }
                        },
                        else: "CONNECTED"
                    }
                },
            }
        },
        {
            $lookup: {
                from: "users",
                let: { friendId: "$friendId", status: "$friendShipStatus" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$friendId"] }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            friendId: 1,
                            friendShipStatus: 1,
                            name: 1,
                            profileImage: 1,
                            profession: 1,
                            position: 1,
                            industry: 1,
                            company: 1,
                            instituteName: 1,
                            courseName: 1,
                            lookingFor: 1,
                            interests: 1,
                            previousBadgeName: 1,
                            email: {
                                $cond: {
                                    if: { $eq: ["$$status", "CONNECTED"] },
                                    then: "$email",
                                    else: null
                                }
                            },
                            contactNumber: {
                                $cond: {
                                    if: { $eq: ["$$status", "CONNECTED"] },
                                    then: "$contactNumber",
                                    else: null
                                }
                            },
                        }
                    }
                ],
                as: "freindProfile"
            }
        },
        {
            $unwind: {
                path: "$freindProfile",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 0,
                friendId: 1,
                friendShipStatus: 1,
                name: "$freindProfile.name",
                profileImage: "$freindProfile.profileImage",
                profession: "$freindProfile.profession",
                position: "$freindProfile.position",
                industry: "$freindProfile.industry",
                company: "$freindProfile.company",
                instituteName: "$freindProfile.instituteName",
                courseName: "$freindProfile.courseName",
                lookingFor: "$freindProfile.lookingFor",
                interests: "$freindProfile.interests",
                email: "$freindProfile.email",
                contactNumber: "$freindProfile.contactNumber",
                previousBadgeName: "$freindProfile.previousBadgeName",
            }
        },
        {
            $addFields: {
                badgeDetails: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: badgeLevels,
                                as: "badge",
                                cond: { $eq: ["$$badge.badgeName", "$previousBadgeName"] }
                            }
                        },
                        0
                    ]
                }
            }
        },
        {
            $addFields: {
                badgeInfo: {
                    badgeName: "$badgeDetails.badgeName",
                    level: "$badgeDetails.level",
                    subText: "$badgeDetails.subText"
                }

            }
        },
        {
            $project: {
                badgeDetails: 0,
                previousBadgeName:0
            }
        }
    ]);

    if (!friendProfile.length) {
       const userProfile = await UserModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(String(friendId)) }
            },
            {
                $project: {
                    _id: 0,
                    friendId: "$_id",
                    friendShipStatus: "NOT_CONNECTED",
                    name: 1,
                    profileImage: 1,
                    profession: 1,
                    position: 1,
                    industry: 1,
                    company: 1,
                    instituteName: 1,
                    courseName: 1,
                    lookingFor: 1,
                    interests: 1,
                    email: null,
                    contactNumber: null,
                    previousBadgeName: 1,
                }
            },
            {
                $addFields: {
                    badgeDetails: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: badgeLevels,
                                    as: "badge",
                                    cond: { $eq: ["$$badge.badgeName", "$previousBadgeName"] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    badgeInfo: {
                        badgeName: "$badgeDetails.badgeName",
                        level: "$badgeDetails.level",
                        subText: "$badgeDetails.subText"
                    }

                }
            },
            {
                $project: {
                    badgeDetails: 0,
                    previousBadgeName:0
                }
            }
        ]);

        if (!userProfile.length)
            throw new AppError("Freind not found", 404);

        return res.status(200).json({
            sucess: true,
            friendProfile: userProfile
        })

    };

    return res.status(200).json({
        sucess: true,
        friendProfile
    })
}