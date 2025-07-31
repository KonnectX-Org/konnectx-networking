import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/appError";
import { UserModel } from "../models/userModel";
import { EventModel } from "../../event/models/eventModel";
import mongoose from "mongoose";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/jwtUtils";
import { Roles } from "../../organization/types/organizationEnums";
import { imageUploader } from "../../../utils/imageUploader";
import { RequestStatusEnum } from "../../friendManagement/types/friendManagementEnums";
import { getBadgeInfo } from "../../../utils/badgeLevels";


// This is a functio used in UserInfo API
const updateUserBadge = async (userId: string, connections: number) => {

  const user = await UserModel.findById(
    new mongoose.Types.ObjectId(userId)
  ).select("previousBadgeName badgeSplashRead");


  if (!user) return {};
  const previousBadgeName = user.previousBadgeName;
  const badgeInfo = getBadgeInfo(connections);

  if (!badgeInfo) {
    return "Unable to determine badege";
  }

  const { badgeName, level, subText } = badgeInfo;


  if (previousBadgeName !== null && previousBadgeName !== badgeName) {
    user.badgeSplashRead = false
  }

  user.previousBadgeName = badgeName;

  const updatedUserData = await user.save();

  return {
    badgeName,
    level,
    subText,
    badgeSplashRead: updatedUserData.badgeSplashRead,
  };
};



export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { data } = req.body;
  if (!data.eventId || !data.name || !data.email)
    throw new AppError("Feild not found", 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    data.eventIds = [data.eventId];
    data.profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${data.name.replace(/ /g, "_")}`;

    const isUserExist = await UserModel.findOne({email:data.email})
    if(isUserExist)
      throw new AppError("User already registerd", 400);

    const [user] = await UserModel.create([data], { session });
    if (!user) throw new AppError("Failed to create new User", 500);

    const updatedEvent = await EventModel.findByIdAndUpdate(
      data.eventId,
      { $push: { attendies: user._id } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    let accessToken = generateAccessToken({
      id: String(user._id),
      role: Roles.USER,
    });
    let refreshToken = generateRefreshToken({
      id: String(user._id),
      role: Roles.USER,
    });

    const updateUser = await UserModel.findByIdAndUpdate(
      user._id,
      { refreshToken },
      { new: true }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      user,
      // updatedEvent,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(error.message, 500);
  }
};

export const UserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const userId = req.user.id;

  console.log("userId", userId);

  const user = await UserModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "friendrequests",
        localField: "_id",
        foreignField: "sender",
        as: "requestSentUser",
      },
    },
    {
      $addFields: {
        requestSent: {
          $size: {
            $filter: {
              input: "$requestSentUser",
              as: "request",
              cond: { $eq: ["$$request.status", RequestStatusEnum.PENDING] },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "friendrequests",
        localField: "_id",
        foreignField: "receiver",
        as: "requestReceivedUser",
      },
    },
    {
      $addFields: {
        requestReceived: {
          $size: {
            $filter: {
              input: "$requestReceivedUser",
              as: "request",
              cond: { $eq: ["$$request.status", RequestStatusEnum.PENDING] },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "friends",
        let: { userId: new mongoose.Types.ObjectId(userId) },
        pipeline: [
          {
            $match: {
              $or: [
                { user1: new mongoose.Types.ObjectId(userId) },
                { user2: new mongoose.Types.ObjectId(userId) },
              ],
            },
          },
          {
            $count: "friendCount",
          },
        ],
        as: "friendshipStatus",
      },
    },
    {
      $addFields: {
        connections: {
          $cond: {
            if: { $gt: [{ $size: "$friendshipStatus" }, 0] },
            then: { $arrayElemAt: ["$friendshipStatus.friendCount", 0] },
            else: 0,
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        requestSent: 1,
        requestReceived: 1,
        connections: 1,
        name: 1,
        email: 1,
        contactNumber: 1,
        profileImage: 1,
        profession: 1,
        position: 1,
        industry: 1,
        company: 1,
        instituteName: 1,
        courseName: 1,
        lookingFor: 1,
        interests: 1,
        status: 1,
        socialLinks:1,
        previousBadgeName: 1,
      },
    },
  ]);

  if (!user.length) throw new AppError("User not found", 404);

  // const userLevelData = getBadgeInfo(user[0]?.connections);
  const userLevelData = await updateUserBadge(userId, user[0]?.connections);

  console.log("userLevelData", userLevelData);

  return res.status(200).json({
    success: true,
    user: user[0],
    userLevelData,
  });
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { data } = req.body;
  const userId = req.user.id;

  const user = await UserModel.findByIdAndUpdate(userId, data, { new: true });
  if (!user) throw new AppError("User not found", 404);

  return res.status(200).json({
    success: true,
    message: "user profile updated",
    user,
  });
};

// replace interest to industry
export const updateInterest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const userId = req.user.id;
  const { data } = req.body;

  if (!data.interestsToRemove.length && !data.newInterests.length)
    throw new AppError("Field not found", 400);

  if (data.interestsToRemove.length) {
    const removedInterest = await UserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      {
        $pull: { industry: { $in: data.interestsToRemove } },
      },
      { new: true }
    );
  }

  if (data.newInterests.length) {
    const updatedInterest = await UserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { $push: { industry: { $each: data.newInterests } } },
      { new: true }
    );
  }

  const updatedInterest = await EventModel.findById(
    new mongoose.Types.ObjectId(userId)
  )
    .lean()
    .select("interests");

  return res.status(200).json({
    success: true,
    updatedInterest,
  });
};

export const updateLookingFor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const userId = req.user.id;
  const { data } = req.body;

  if (!data.lookingForToRemove.length && !data.newLookingFor.length)
    throw new AppError("Field not found", 400);

  if (data.lookingForToRemove.length) {
    await UserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      {
        $pull: { lookingFor: { $in: data.lookingForToRemove } },
      },
      { new: true }
    );
  }

  if (data.newLookingFor.length) {
    await UserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { $push: { lookingFor: { $each: data.newLookingFor } } },
      { new: true }
    );
  }

  const updatedlookinFor = await UserModel.findById(
    new mongoose.Types.ObjectId(userId)
  )
    .lean()
    .select("lookingFor");

  return res.status(200).json({
    success: true,
    updatedlookinFor,
  });
};

export const editProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const userId = req.user.id;

  if (!req.file) throw new AppError("No file uploaded", 400);

  const imageUrl = await imageUploader(req.file);
  if (!imageUrl) throw new AppError("Failed to upload Image", 500);

  const updatedProfile = await UserModel.findByIdAndUpdate(
    new mongoose.Types.ObjectId(userId),
    {
      $set: {
        profileImage: imageUrl,
      },
    },
    { new: true }
  );

  if (!updatedProfile) throw new AppError("Image not updated", 500);

  return res.status(200).json({
    sucess: true,
    profileImage: updatedProfile.profileImage,
  });
};

export const badgeSplashReadStatus =async(
  req:Request,
  res:Response,
  next:NextFunction
):Promise<Response|void> =>{
  const userId = req.user.id;

  const updatedBadgeStatus = await UserModel.findByIdAndUpdate(
    new mongoose.Types.ObjectId(userId),
    {
      $set:{ badgeSplashRead: true }
    },
    { new: true}
  ) ;

  if(!updatedBadgeStatus)
    throw new AppError("Failed to updated status", 500);

  return res.status(200).json({
    sucess:true,
    badgeSplashRead : updatedBadgeStatus.badgeSplashRead
  })
}


// ----------------New API'S------------------

export const updateProfileBio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  const { profileBio } = req.body;

  if (!profileBio) {
    return next(new AppError("profileBio is required", 400));
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { profileBio },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Profile bio updated",
    data: user?.profileBio,
  });
};

// ----------------- Update socialLinks -----------------

export const updateSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  const { socialLinks } = req.body;

  if (!Array.isArray(socialLinks)) {
    return next(new AppError("socialLinks must be an array", 400));
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { socialLinks },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Social links updated",
    data: user?.socialLinks,
  });
};

// ----------------- Update services -----------------

export const updateServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  const { services } = req.body;

  if (!Array.isArray(services)) {
    return next(new AppError("services must be an array", 400));
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { services },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Services updated",
    data: user?.services,
  });
};
