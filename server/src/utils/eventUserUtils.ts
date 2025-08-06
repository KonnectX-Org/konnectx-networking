import { EventUserModel } from "../modules/event/models/eventUsersModel";
import { UserModel } from "../modules/user/models/userModel";
import mongoose from "mongoose";
import AppError from "./appError";

/**
 * Get EventUser with populated User data
 */
export const getEventUserContext = async (eventUserId: string) => {
  const eventUser = await EventUserModel.findById(eventUserId)
    .populate('userId')
    .populate('eventId');
    
  if (!eventUser) {
    throw new AppError("Event user not found", 404);
  }
  
  return eventUser;
};

/**
 * Get User profile data combined with EventUser specific data
 */
export const getUserProfileForEvent = async (userId: string, eventId: string) => {
  const user = await UserModel.findById(userId);
  const eventUser = await EventUserModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    eventId: new mongoose.Types.ObjectId(eventId)
  });

  if (!user || !eventUser) {
    throw new AppError("User or event registration not found", 404);
  }

  return {
    user: user.toObject(),
    eventUser: eventUser.toObject()
  };
};

/**
 * Verify user has access to event
 */
export const verifyEventAccess = async (userId: string, eventId: string) => {
  const eventUser = await EventUserModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    eventId: new mongoose.Types.ObjectId(eventId)
  });

  if (!eventUser) {
    throw new AppError("User not registered for this event", 403);
  }

  return eventUser;
};
