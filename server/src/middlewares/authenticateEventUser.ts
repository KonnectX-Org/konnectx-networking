import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from "../utils/jwtUtils";
import AppError from '../utils/appError';
import { Roles } from '../modules/organization/types/organizationEnums';
import { EventUserModel } from '../modules/event/models/eventUsersModel';
import mongoose from 'mongoose';

interface TokenPayload {
  id: string;
  role: string;
  eventId?: string;
  eventUserId?: string;
}

/**
 * Middleware to authenticate event-specific users
 * Ensures the user is authenticated for a specific event
 */
export const authenticateEventUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const token = req.cookies["accessToken"];

  if (!token) {
    return next(new AppError("Token must be provided", 401));
  }

  try {
    const payload: TokenPayload | null = verifyAccessToken(token);

    if (!payload || payload.role !== Roles.USER) {
      return next(new AppError("Unauthorized: Invalid token", 401));
    }

    // For event-specific operations, we need eventId and eventUserId
    if (!payload.eventId || !payload.eventUserId) {
      return next(new AppError("Unauthorized: Event context required", 401));
    }

    // Verify the EventUser still exists and is valid
    const eventUser = await EventUserModel.findById(payload.eventUserId).populate('userId');
    
    if (!eventUser) {
      return next(new AppError("Unauthorized: Event user not found", 401));
    }

    // Verify the eventUser belongs to the correct event
    if (eventUser.eventId.toString() !== payload.eventId) {
      return next(new AppError("Unauthorized: Event mismatch", 401));
    }

    // Set both user and eventUser context
    req.user = { id: payload.id };
    req.eventUser = {
      id: payload.eventUserId,
      tokenEventId: payload.eventId, // Rename to avoid conflict
      tokenUserId: payload.id, // Rename to avoid conflict
      ...eventUser.toObject()
    };

    return next();
  } catch (err) {
    return next(new AppError('Unauthorized: Invalid token', 401));
  }
};

/**
 * Middleware to check if the requested eventId matches the authenticated event
 */
export const validateEventContext = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const { eventId } = req.params;
  console.log("Validating event context for eventId:", eventId);
  console.log("Authenticated eventUser:", req.eventUser);
  
  if (!req.eventUser) {
    return next(new AppError("Event context not found", 401));
  }

  if (req.eventUser.eventId !== eventId) {
    return next(new AppError("Unauthorized: Event context mismatch", 403));
  }

  return next();
};
