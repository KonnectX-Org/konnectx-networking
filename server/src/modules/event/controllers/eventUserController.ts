import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/appError";
import { EventModel } from "../models/eventModel";
import { EventUserModel } from "../models/eventUsersModel";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { UserModel } from "../../user/models/userModel";
import { FriendRequestModel } from "../../friendManagement/models/friendReqModel";
import { FriendModel } from "../../friendManagement/models/friendModel";

// API'S 
// getGuestOfAnEvent   -->> ( Get all guests of a particular event )
// getAllEventsOfUser  -->> ( All Events of a particular User)
// getAttendiesRole    -->> ( Get Attendee Roles )
// searchGuestInEvents -->> ( searchGuestInEvents )
// searchGuest 


// Get all guests of a particular event 
export const getGuestOfAnEvent = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const { name, sortOrder, eventId, selectedInterest, profession, position, industry, limit = 10, cursor } = req.query;
    const userId = req.user.id;

    if (!eventId)
        throw new AppError("Query(eventId) not found", 400);

    console.log("position", position);
    console.log("is array", Array.isArray(position))

    // Ensure industry is always an array
    const industryArray = industry ? (Array.isArray(industry) ? industry : [industry]) : [];

    const filteredSelectedInterest = Array.isArray(selectedInterest)
        ? selectedInterest.filter((item: any) => item.trim() !== "")
        : [];

    let selectedInterestLength = filteredSelectedInterest.length;


    // extracting all known UserIds (freind, request sent, request receive)
    const data = await FriendRequestModel.aggregate([
        {
            $match: {
                $or: [
                    { sender: new mongoose.Types.ObjectId(userId) },
                    { receiver: new mongoose.Types.ObjectId(userId) }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                otherUserIds: {
                    $cond: {
                        if: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
                        then: "$receiver",
                        else: "$sender"
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                otherUserIds: { $addToSet: "$otherUserIds" }
            }
        },
        {
            $project: {
                _id: 0,
                otherUserIds: 1
            }
        }
    ]);

    // connected users
    const connectedUsers = await FriendModel.aggregate([
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
                _id: 0,
                otherUserIds: {
                    $cond: {
                        if: { $eq: ["$user1", new mongoose.Types.ObjectId(userId)] },
                        then: "$user2",
                        else: "$user1"
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                otherUserIds: { $addToSet: "$otherUserIds" }
            }
        },
        {
            $project: {
                _id: 0,
                otherUserIds: 1
            }
        }
    ]);

    const connectedUsersIds = connectedUsers && connectedUsers.length > 0 ? connectedUsers[0].otherUserIds : [];
    const pendingRequestUserIds = data && data.length > 0 ? data[0].otherUserIds : [];

    const knownUserIdsArray = [
        ...(pendingRequestUserIds),
        ...(connectedUsersIds)
    ];

    const knownUserIds = [...new Set(knownUserIdsArray)];

    // extracting current user's event-specific data for matching
    const currentEventUser = await EventUserModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        eventId: new mongoose.Types.ObjectId(String(eventId))
    }).select('profession position company instituteName courseName industry lookingFor');

    if (!currentEventUser) {
        throw new AppError("User not registered for this event", 404);
    }

    const lookingFor = currentEventUser.lookingFor || [];
    const userIndustry = currentEventUser.industry || [];
    const userProfession = currentEventUser.profession || "NA";
    const userPosition = currentEventUser.position || "NA";
    const userInstituteName = currentEventUser.instituteName || "NA";
    const userCompany = currentEventUser.company || "NA";
    const userCourseName = currentEventUser.courseName || "NA";

    // extracting all unknown users(Preparing by adding new fields in each user )
    const eventGuests = await EventUserModel.aggregate([
        {
            $match: {
                eventId: new mongoose.Types.ObjectId(String(eventId)),
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "userId",
                as: "userBasicInfo"
            }
        },
        {
            $addFields: {
                // Map EventUser data with basic user info
                userData: {
                    $mergeObjects: [
                        {
                            _id: "$userId",
                            name: { $arrayElemAt: ["$userBasicInfo.name", 0] },
                            email: { $arrayElemAt: ["$userBasicInfo.email", 0] },
                            // Event-specific profile data from EventUser
                            interests: "$interests",
                            profileImage: "$profileImage",
                            profession: "$profession",
                            position: "$position",
                            company: "$company",
                            industry: "$industry",
                            instituteName: "$instituteName",
                            courseName: "$courseName",
                            lookingFor: "$lookingFor",
                            createdAt: "$createdAt"
                        }
                    ]
                }
            }
        },
        {
            $addFields: {
                userData: {
                    $mergeObjects: [
                        "$userData",
                        {
                            lookingForMatchedCount: {
                                $size: {
                                    $setIntersection: [
                                        {
                                            $setUnion: [
                                                { $ifNull: [{ $split: ["$profession", ","] }, []] },
                                                { $ifNull: [{ $split: ["$position", ","] }, []] }
                                            ]
                                        },
                                        lookingFor
                                    ]
                                }
                            },
                            industryMatchCount: {
                                $size: {
                                    $setIntersection: [
                                        { $ifNull: ["$industry", []] },
                                        userIndustry
                                    ]
                                }
                            },
                            professionMatchCount: {
                                $cond: {
                                    if: { $eq: ["$profession", userProfession] },
                                    then: 1,
                                    else: 0
                                }
                            },
                            positionMatchCount: {
                                $cond: {
                                    if: { $eq: ["$position", userPosition] },
                                    then: 1,
                                    else: 0
                                }
                            },
                            instituteNameMatchCount: {
                                $cond: {
                                    if: { $eq: ["$instituteName", userInstituteName] },
                                    then: 1,
                                    else: 0
                                }
                            },
                            companyNameMatchCount: {
                                $cond: {
                                    if: { $eq: ["$company", userCompany] },
                                    then: 1,
                                    else: 0
                                }
                            },
                            courseNameMatchCount: {
                                $cond: {
                                    if: { $eq: ["$courseName", userCourseName] },
                                    then: 1,
                                    else: 0
                                }
                            },
                            isNameMatch: name ? { $regexMatch: { input: { $arrayElemAt: ["$userBasicInfo.name", 0] }, regex: name, options: "i" } } : true,
                            isProfessionMatch: profession ? { $regexMatch: { input: "$profession", regex: profession, options: "i" } } : true,
                            isPositionMatch: position?.length ? {
                                $gte: [
                                    {
                                        $size: {
                                            $setIntersection: [
                                                {
                                                    $setUnion: [
                                                        { $ifNull: [{ $split: ["$position", ","] }, []] }
                                                    ]
                                                },
                                                position
                                            ]
                                        }
                                    },
                                    1
                                ]
                            } : true,
                            isIndustryMatch: industryArray.length > 0 ? {
                                $gte: [
                                    {
                                        $size: {
                                            $setIntersection: [
                                                { $ifNull: ["$industry", []] },
                                                industryArray
                                            ]
                                        }
                                    },
                                    1
                                ]
                            } : true
                        }
                    ]
                }
            }
        },
        {
            $addFields: {
                userData: {
                    $mergeObjects: [
                        "$userData",
                        {
                            totalMatchCount: {
                                $add: [
                                    { $ifNull: ["$userData.professionMatchCount", 0] },
                                    { $ifNull: ["$userData.positionMatchCount", 0] },
                                    { $ifNull: ["$userData.instituteNameMatchCount", 0] },
                                    { $ifNull: ["$userData.companyNameMatchCount", 0] },
                                    { $ifNull: ["$userData.courseNameMatchCount", 0] },
                                    { $ifNull: ["$userData.industryMatchCount", 0] },
                                ]
                            },
                            lookingForMatchedCountWithBonus: {
                                $cond: {
                                    if: { $gt: ["$userData.lookingForMatchedCount", 0] },
                                    then: { $add: ["$userData.lookingForMatchedCount", 10] },
                                    else: "$userData.lookingForMatchedCount"
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            $match: {
                $and: [
                    { userId: { $ne: new mongoose.Types.ObjectId(userId) } },
                    { userId: { $not: { $in: knownUserIds } } },
                    {
                        $expr: {
                            $cond: {
                                if: { $gt: [selectedInterestLength, 0] },
                                then: {
                                    $gt: [
                                        { $size: { $setIntersection: ["$lookingFor", selectedInterest] } },
                                        0
                                    ]
                                },
                                else: true
                            }
                        }
                    },
                    { $expr: { $eq: ["$userData.isNameMatch", true] } },
                    { $expr: { $eq: ["$userData.isProfessionMatch", true] } },
                    { $expr: { $eq: ["$userData.isPositionMatch", true] } },
                    { $expr: { $eq: ["$userData.isIndustryMatch", true] } },
                ]
            }
        },
        {
            $sort: {
                "userData.lookingForMatchedCountWithBonus": -1,
                "userData.totalMatchCount": -1,
                "createdAt": sortOrder === 'asc' ? 1 : -1
            }
        },
        {
            $group: {
                _id: null,
                users: { $push: "$$ROOT" }
            }
        },
        {
            $addFields: {
                users: {
                    $map: {
                        input: "$users",
                        as: "user",
                        in: {
                            $mergeObjects: [
                                "$$user",
                                {
                                    matchIndex: { $add: [1, { $indexOfArray: ["$users", "$$user"] }] }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unwind: "$users"
        },
        ...(cursor ? [
            {
                $match: {
                    "users.matchIndex": { $gt: parseInt(String(cursor)) }
                }
            }
        ] : []),
        {
            $limit: parseInt(String(limit))
        },
        {
            $project: {
                _id: "$users.userData._id",
                name: "$users.userData.name",
                industry: "$users.industry",
                interests: "$users.interests",
                profileImage: "$users.profileImage",
                profession: "$users.profession",
                position: "$users.position",
                company: "$users.company",
                instituteName: "$users.instituteName",
                courseName: "$users.courseName",
                lookingFor: "$users.lookingFor",
                matchCount: "$users.userData.totalMatchCount",
                matchIndex: "$users.matchIndex"
            }
        }
    ]);

    if (!eventGuests.length)
        throw new AppError("Events not available", StatusCodes.NO_CONTENT);

    return res.status(200).json({
        success: true,
        eventGuests,
    });
}




// All Events of a particular User
// onGoing → abhi chal raha hai
// upComing → aane wala hai
// past → khatam ho gaya
export const getAllEventsOfUser = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {
    const userId = req.user.id;

    const currentDate = new Date();

    const events = await EventUserModel.aggregate([
        {
            $match: { userId: new mongoose.Types.ObjectId(String(userId)) }
        },
        {
            $lookup: {
                from: "events",
                foreignField: "_id",
                localField: "eventId",
                as: "events"
            }
        },
        {
            $unwind: "$events"
        },
        {
            $project: {
                _id: 0,
                eventId: "$events._id",
                name: "$events.name",
                description: "$events.description",
                type: "$events.type",
                startDate: "$events.startDate",
                endDate: "$events.endDate",
                venue: "$events.venue",
                city: "$events.city",
                banner: "$events.banner",
                status: {
                    $cond: {
                        if: { $and: [{ $gte: ["$events.endDate", currentDate] }, { $lte: ["$events.startDate", currentDate] }] },
                        then: "ongoing",
                        else: {
                            $cond: {
                                if: { $gt: ["$events.startDate", currentDate] },
                                then: "upcoming",
                                else: "past"
                            }
                        }
                    }
                }
            }
        },
        {
            $group: {  // three Arrays me convert 
                _id: null,
                onGoing: {
                    $push: {
                        $cond: [
                            { $and: [{ $gte: ["$endDate", currentDate] }, { $lte: ["$startDate", currentDate] }] },
                            "$$ROOT",
                            null
                        ]
                    }
                },
                upComing: {
                    $push: {
                        $cond: [
                            { $gt: ["$startDate", currentDate] },
                            "$$ROOT",
                            null
                        ]
                    }
                },
                past: {
                    $push: {
                        $cond: [
                            { $lt: ["$endDate", currentDate] },
                            "$$ROOT",
                            null
                        ]
                    }
                }
            }
        },
        {
            $project: {
                onGoing: {
                    $filter: {
                        input: "$onGoing",
                        as: "event",
                        cond: { $ne: ["$$event", null] }
                    }
                },
                upComing: {
                    $filter: {
                        input: "$upComing",
                        as: "event",
                        cond: { $ne: ["$$event", null] }
                    }
                },
                past: {
                    $filter: {
                        input: "$past",
                        as: "event",
                        cond: { $ne: ["$$event", null] }
                    }
                },
                _id: 0
            }
        }
    ]);

    if (!events.length)
        throw new AppError("Event not found", 404);

    return res.status(200).json({
        success: true,
        events
    })
}






// Get Attendee Roles 
export const getAttendiesRole = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    const { eventId } = req.query;

    if (!eventId)
        throw new AppError("Query not found", 400);

    const attendeeRoles = await EventModel.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(String(eventId)) }
        },
        {
            $project: {
                _id: 0,
                attendeeRoles: 1
            }
        }
    ]);

    if (!attendeeRoles.length)
        throw new AppError("Roles not found", 404);

    return res.status(200).json({
        success: true,
        attendeeRoles
    });
}







// searchGuestInEvents
export const searchGuestInEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    const { name, sortOrder, eventId, selectedInterest, profession, position, industry, limit = 15, cursor } = req.query;
    const userId = req.user.id;

    console.log("name :", name, profession);
    const parsedLimit = Number.isNaN(parseInt(String(limit))) ? 10 : parseInt(String(limit));

    if (!eventId)
        throw new AppError("Query(eventId) not found", 400);

    // Ensure industry is always an array
    const industryArray = industry ? (Array.isArray(industry) ? industry : [industry]) : [];

    const filteredSelectedInterest = Array.isArray(selectedInterest)
        ? selectedInterest.filter((item: any) => item.trim() !== "")
        : [];

    let selectedInterestLength = filteredSelectedInterest.length;


    // extracting all connected UserIds
    const data = await FriendModel.aggregate([
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
                _id: 0,
                otherUserIds: {
                    $cond: {
                        if: { $eq: ["$user1", new mongoose.Types.ObjectId(userId)] },
                        then: "$user2",
                        else: "$user1"
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                otherUserIds: { $addToSet: "$otherUserIds" }
            }
        },
        {
            $project: {
                _id: 0,
                otherUserIds: 1
            }
        }
    ]);
    const knownUserIds = (data && data[0]?.otherUserIds) ?? [];

    // extracting current user's event-specific data for matching
    const currentEventUser = await EventUserModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        eventId: new mongoose.Types.ObjectId(String(eventId))
    }).select('lookingFor industry');

    if (!currentEventUser) {
        throw new AppError("User not registered for this event", 404);
    }

    const lookingFor = currentEventUser.lookingFor || [];
    const userIndustry = currentEventUser.industry || [];

    // extracting all users
    const eventGuests = await EventUserModel.aggregate([
        {
            $match: {
                eventId: new mongoose.Types.ObjectId(String(eventId)),
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "userId",
                as: "userBasicInfo"
            }
        },
        {
            $addFields: {
                // Map EventUser data with basic user info
                userData: {
                    $mergeObjects: [
                        {
                            _id: "$userId",
                            name: { $arrayElemAt: ["$userBasicInfo.name", 0] },
                            email: { $arrayElemAt: ["$userBasicInfo.email", 0] },
                            // Event-specific profile data from EventUser
                            interests: "$interests",
                            profileImage: "$profileImage",
                            profession: "$profession",
                            position: "$position",
                            company: "$company",
                            industry: "$industry",
                            instituteName: "$instituteName",
                            courseName: "$courseName",
                            lookingFor: "$lookingFor",
                            createdAt: "$createdAt"
                        }
                    ]
                }
            }
        },
        {
            $addFields: {
                userData: {
                    $mergeObjects: [
                        "$userData",
                        {
                            isConnected: {
                                $in: ["$userId", knownUserIds]
                            },
                            lookingForMatchedCount: {
                                $size: {
                                    $setIntersection: [
                                        {
                                            $setUnion: [
                                                { $ifNull: [{ $split: ["$profession", ","] }, []] },
                                                { $ifNull: [{ $split: ["$position", ","] }, []] }
                                            ]
                                        },
                                        lookingFor
                                    ]
                                }
                            },
                            industryMatchCount: {
                                $size: {
                                    $setIntersection: [
                                        { $ifNull: ["$industry", []] },
                                        userIndustry
                                    ]
                                }
                            },
                            isAnyMatch: name ? {
                                $or: [
                                    { $regexMatch: { input: { $arrayElemAt: ["$userBasicInfo.name", 0] }, regex: name, options: "i" } },
                                    { $regexMatch: { input: "$profession", regex: name, options: "i" } },
                                    { $regexMatch: { input: "$position", regex: name, options: "i" } },
                                    { $regexMatch: { input: "$instituteName", regex: name, options: "i" } },
                                    { $regexMatch: { input: "$company", regex: name, options: "i" } },
                                    { $regexMatch: { input: "$courseName", regex: name, options: "i" } },
                                ]
                            } : true
                        }
                    ]
                }
            }
        },
        {
            $addFields: {
                userData: {
                    $mergeObjects: [
                        "$userData",
                        {
                            totalMatchCount: {
                                $add: [
                                    { $ifNull: ["$userData.lookingForMatchedCount", 0] },
                                    { $ifNull: ["$userData.industryMatchCount", 0] },
                                ]
                            }
                        }
                    ]
                }
            }
        },
        {
            $match: {
                $and: [
                    { userId: { $ne: new mongoose.Types.ObjectId(userId) } },
                    { $expr: { $eq: ["$userData.isAnyMatch", true] } },
                ]
            }
        },
        {
            $sort: {
                "userData.totalMatchCount": -1,
                "createdAt": sortOrder === 'asc' ? 1 : -1
            }
        },
        ...(cursor ? [
            {
                $match: {
                    "userId": { $gt: new mongoose.Types.ObjectId(String(cursor)) }
                }
            }
        ] : []),
        {
            $limit: parsedLimit
        },
        {
            $project: {
                _id: "$userData._id",
                name: "$userData.name",
                industry: "$industry",
                interests: "$interests",
                profileImage: "$profileImage",
                profession: "$profession",
                position: "$position",
                company: "$company",
                instituteName: "$instituteName",
                courseName: "$courseName",
                lookingFor: "$lookingFor",
                matchCount: "$userData.lookingForMatchedCount",
                isConnected: "$userData.isConnected"
            }
        }
    ]);

    if (!eventGuests.length)
        throw new AppError("Events not available", StatusCodes.NO_CONTENT);

    return res.status(200).json({
        success: true,
        eventGuests,
        // knownUserIds
    });
}