import {Request, Response, NextFunction } from "express";
import AppError from "../../../utils/appError";
import { EventModel } from "../../event/models/eventModel";
import { OrganizationModel } from "../../organization/models/organizationModel";
import { UserModel } from "../../user/models/userModel";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "colors";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../../utils/jwtUtils";

import { Roles } from "../../organization/types/organizationEnums";


// createEvent
export const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      venue,
      city,
      banner,
      attendeeRoles,
      publish,
    } = req.body;

    console.log("req is in man konnectx event cete controller ");
  
    
    if (!name || !type || !startDate || !endDate || !venue || !city) {
      throw new AppError("Required fields are missing", 400);
    }
  
    
    const event = await EventModel.create({
      name,
      description,
      type,
      startDate,
      endDate,
      venue,
      city,
      banner,
      attendeeRoles,
      publish,
      organizationId: null
    });
  
    if (!event) {
      throw new AppError("Failed to create event", 500);
    }
  
    return res.status(200).json({
      success: true,
      event,
    });
  };


