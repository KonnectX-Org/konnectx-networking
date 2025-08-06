import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/appError";
import { UserModel } from "../models/userModel";
import { EventModel } from "../../event/models/eventModel";
import { EventUserModel } from "../../event/models/eventUsersModel";
import mongoose from "mongoose";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/jwtUtils";
import { Roles } from "../../organization/types/organizationEnums";
import { imageUploader } from "../../../utils/imageUploader";
import { RequestStatusEnum } from "../../friendManagement/types/friendManagementEnums";
import { getBadgeInfo } from "../../../utils/badgeLevels";
import { sendLoginOtp } from "../../../services/emails/triggers/auth/loginUserOtp";

// This function is used in UserInfo API - now works with EventUser
const updateUserBadge = async (eventUserId: string, connections: number) => {
  const eventUser = await EventUserModel.findById(
    new mongoose.Types.ObjectId(eventUserId)
  ).select("previousBadgeName badgeSplashRead");

  if (!eventUser) return {};
  const previousBadgeName = eventUser.previousBadgeName;
  const badgeInfo = getBadgeInfo(connections);

  if (!badgeInfo) {
    return "Unable to determine badge";
  }

  const { badgeName, level, subText } = badgeInfo;

  if (previousBadgeName !== null && previousBadgeName !== badgeName) {
    eventUser.badgeSplashRead = false;
  }

  eventUser.previousBadgeName = badgeName;

  const updatedEventUserData = await eventUser.save();

  return {
    badgeName,
    level,
    subText,
    badgeSplashRead: updatedEventUserData.badgeSplashRead,
  };
};

// create user (only in one event at a time )
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { data } = req.body;
  console.log("Data : ", data);
  if (
    !data.eventId ||
    !data.name ||
    !data.email ||
    // !data.role ||
    !data.industry
  ) {
    throw new AppError("Missing required fields", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  // Create or find the basic user identity
  let user = await UserModel.findOne({ email: data.email });

  if (!user) {
    const [createdUser] = await UserModel.create([{ 
      name: data.name,
      email: data.email,
      // Only basic identity fields
    }], { session });
    if (!createdUser) throw new AppError("Failed to create user", 500);
    user = createdUser;
  }

  const isAlreadyMapped = await EventUserModel.findOne({
    userId: user._id,
    eventId: data.eventId,
  });

  if (isAlreadyMapped) {
    throw new AppError("User already registered for this event", 400);
  }

  // Create event-specific user with all profile data
  const profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${data.name.replace(/ /g, "_")}`;

  const [eventUser] = await EventUserModel.create(
    [
      {
        userId: user._id,
        eventId: data.eventId,
        contactNumber: data.contactNumber,
        profileImage: profileImage,
        profession: data.profession,
        position: data.position,
        industry: Array.isArray(data.industry) ? data.industry : (data.industry ? [data.industry] : []),
        help: data.help || [],
        company: data.company,
        instituteName: data.instituteName,
        courseName: data.courseName,
        lookingFor: data.lookingFor || [],
        interests: data.interests || [],
        profileBio: data.profileBio,
        socialLinks: data.socialLinks || [],
        services: data.services || [],
        lookingToConnectWith: data.lookingToConnectWith || [],
      },
    ],
    { session }
  );

  if (!eventUser) throw new AppError("Failed to create event user", 500);

  await session.commitTransaction();
  session.endSession();

  const accessToken = generateAccessToken({
    id: String(user._id),
    role: Roles.USER,
    eventId: data.eventId,
    eventUserId: String(eventUser._id),
  });

  const refreshToken = generateRefreshToken({
    id: String(user._id),
    role: Roles.USER,
    eventId: data.eventId,
    eventUserId: String(eventUser._id),
  });

  // Store refresh token in EventUser
  await EventUserModel.findByIdAndUpdate(eventUser._id, { refreshToken });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    user,
    eventUser,
  });
};

export const checkUserEventRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  // If we have event context from token, verify it matches the requested event
  if (req.eventUser && req.eventUser.eventId !== eventId) {
    return res.status(200).json({
      success: true,
      registered: false,
      message: "User authenticated for different event"
    });
  }

  const isRegistered = await EventUserModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    eventId: new mongoose.Types.ObjectId(eventId),
  });

  return res.status(200).json({
    success: true,
    registered: !!isRegistered,
  });
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, eventId } = req.body;
    
    // Validate input
    if (!email || !eventId) {
      return next(new AppError("Email and eventId are required", 400));
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return next(new AppError("User not found. Please register first.", 404));
    }

    // Check if user is registered for this event
    const eventUser = await EventUserModel.findOne({ 
      userId: user._id, 
      eventId: new mongoose.Types.ObjectId(eventId) 
    });
    
    if (!eventUser) {
      return next(new AppError("User not registered for this event.", 404));
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("OTP for debugging:", otp); // Remove in production

    // Save OTP with expiry in EventUser (event-specific)
    eventUser.otp = otp;
    eventUser.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    await eventUser.save();

    // Send OTP email
    await sendLoginOtp({
      email: user.email,
      otp: otp,
    });

    // Return success response (without OTP in production)
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // Don't send OTP in production - only for testing
      otp: process.env.NODE_ENV === "development" ? otp : undefined
    });

  } catch (error) {
    console.error("Login error:", error);
    next(new AppError("Failed to process login request", 500));
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { email, otp, eventId } = req.body;

  if (!email || !otp || !eventId) return next(new AppError("Missing fields", 400));

  const user = await UserModel.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  // Find the EventUser for this specific event
  const eventUser = await EventUserModel.findOne({
    userId: user._id,
    eventId: new mongoose.Types.ObjectId(eventId)
  });

  if (!eventUser) return next(new AppError("User not registered for this event", 404));

  if (
    !eventUser.otp ||
    !eventUser.otpExpiry ||
    eventUser.otp !== otp ||
    eventUser.otpExpiry < new Date()
  ) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  // Clear OTP from EventUser
  eventUser.otp = null;
  eventUser.otpExpiry = null;
  await eventUser.save();

  const accessToken = generateAccessToken({
    id: String(user._id),
    role: Roles.USER,
    eventId: eventId,
    eventUserId: String(eventUser._id),
  });

  const refreshToken = generateRefreshToken({
    id: String(user._id),
    role: Roles.USER,
    eventId: eventId,
    eventUserId: String(eventUser._id),
  });

  // Store refresh token in EventUser
  await EventUserModel.findByIdAndUpdate(eventUser._id, { refreshToken });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    user,
    eventUser, // Include event-specific user data
  });
};

export const UserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const userId = req.user.id;
  const eventUserId = req.eventUser?.id;
  const eventId = req.eventUser?.tokenEventId;

  console.log("userId", userId, "eventUserId", eventUserId, "eventId", eventId);

  if (!eventUserId || !eventId) {
    throw new AppError("Event context required", 400);
  }

  // Get basic user info
  const user = await UserModel.findById(userId).select('name email status emailVerified');
  if (!user) throw new AppError("User not found", 404);

  // Get event-specific user data with aggregation for connections
  const eventUserData = await EventUserModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(eventUserId) },
    },
    {
      $lookup: {
        from: "friendrequests",
        localField: "userId",
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
        localField: "userId",
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
  ]);

  if (!eventUserData.length) throw new AppError("Event user not found", 404);

  const eventUser = eventUserData[0];
  const userLevelData = await updateUserBadge(eventUserId, eventUser.connections);


  return res.status(200).json({
    success: true,
    user: user,
    eventUser: eventUser,
    userLevelData,
  });
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { data } = req.body;
  const eventUserId = req.eventUser?.id;

  if (!eventUserId) {
    throw new AppError("Event context required", 400);
  }

  const eventUser = await EventUserModel.findByIdAndUpdate(eventUserId, data, { new: true });
  if (!eventUser) throw new AppError("Event user not found", 404);

  return res.status(200).json({
    success: true,
    message: "event user profile updated",
    eventUser,
  });
};

// replace interest to industry (now event-specific)
export const updateInterest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const eventUserId = req.eventUser?.id;
  const { data } = req.body;

  if (!eventUserId) {
    throw new AppError("Event context required", 400);
  }

  if (!data.interestsToRemove.length && !data.newInterests.length)
    throw new AppError("Field not found", 400);

  if (data.interestsToRemove.length) {
    await EventUserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(eventUserId),
      {
        $pull: { interests: { $in: data.interestsToRemove } },
      },
      { new: true }
    );
  }

  if (data.newInterests.length) {
    await EventUserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(eventUserId),
      { $push: { interests: { $each: data.newInterests } } },
      { new: true }
    );
  }

  const updatedInterest = await EventUserModel.findById(
    new mongoose.Types.ObjectId(eventUserId)
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
  const eventUserId = req.eventUser?.id;
  const { data } = req.body;

  if (!eventUserId) {
    throw new AppError("Event context required", 400);
  }

  if (!data.lookingForToRemove.length && !data.newLookingFor.length)
    throw new AppError("Field not found", 400);

  if (data.lookingForToRemove.length) {
    await EventUserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(eventUserId),
      {
        $pull: { lookingFor: { $in: data.lookingForToRemove } },
      },
      { new: true }
    );
  }

  if (data.newLookingFor.length) {
    await EventUserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(eventUserId),
      { $push: { lookingFor: { $each: data.newLookingFor } } },
      { new: true }
    );
  }

  const updatedlookinFor = await EventUserModel.findById(
    new mongoose.Types.ObjectId(eventUserId)
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
  const eventUserId = req.eventUser?.id;

  if (!eventUserId) {
    throw new AppError("Event context required", 400);
  }

  if (!req.file) throw new AppError("No file uploaded", 400);

  const imageUrl = await imageUploader(req.file);
  if (!imageUrl) throw new AppError("Failed to upload Image", 500);

  const updatedProfile = await EventUserModel.findByIdAndUpdate(
    new mongoose.Types.ObjectId(eventUserId),
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

export const badgeSplashReadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const eventUserId = req.eventUser?.id;

  if (!eventUserId) {
    throw new AppError("Event context required", 400);
  }

  const updatedBadgeStatus = await EventUserModel.findByIdAndUpdate(
    new mongoose.Types.ObjectId(eventUserId),
    {
      $set: { badgeSplashRead: true },
    },
    { new: true }
  );

  if (!updatedBadgeStatus) throw new AppError("Failed to updated status", 500);

  return res.status(200).json({
    sucess: true,
    badgeSplashRead: updatedBadgeStatus.badgeSplashRead,
  });
};

// ----------------New API'S------------------

export const updateProfileBio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const eventUserId = req.eventUser?.id;
  const { profileBio } = req.body;

  if (!eventUserId) {
    return next(new AppError("Event context required", 400));
  }

  if (!profileBio) {
    return next(new AppError("profileBio is required", 400));
  }

  const eventUser = await EventUserModel.findByIdAndUpdate(
    eventUserId,
    { profileBio },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Profile bio updated",
    data: eventUser?.profileBio,
  });
};

// ----------------- Update socialLinks -----------------

export const updateSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const eventUserId = req.eventUser?.id;
  const { socialLinks } = req.body;

  if (!eventUserId) {
    return next(new AppError("Event context required", 400));
  }

  if (!Array.isArray(socialLinks)) {
    return next(new AppError("socialLinks must be an array", 400));
  }

  const eventUser = await EventUserModel.findByIdAndUpdate(
    eventUserId,
    { socialLinks },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Social links updated",
    data: eventUser?.socialLinks,
  });
};

// ----------------- Update services -----------------

export const updateServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const eventUserId = req.eventUser?.id;
  const { services } = req.body;

  if (!eventUserId) {
    return next(new AppError("Event context required", 400));
  }

  if (!Array.isArray(services)) {
    return next(new AppError("services must be an array", 400));
  }

  const eventUser = await EventUserModel.findByIdAndUpdate(
    eventUserId,
    { services },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Services updated",
    data: eventUser?.services,
  });
};
