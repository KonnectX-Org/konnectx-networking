import {Request, Response, NextFunction } from "express";
import AppError from "../../../utils/appError";
import { ReqModel as reqModel } from "../models/reqModel";
import { ReqMessageModel as msgModel } from "../models/msgModel";
import { ReqThreadModel as threadModel } from "../models/threadModel";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { io } from "../../../index";
import { handleNewMessage } from "../sockets/eventHadlers";

// API'S
// postRequirement
// getAllRequirementsOfEvent


// postRequirement
export const postRequirement = async(req:Request,res:Response,next:NextFunction):Promise<Response|void> =>{

  const { title, description, tags } = req.body;

  const {eventId} = req.params;

  const posterId = req.user?.id;

  if (!posterId) {
    return next(new AppError("Unauthorized access", StatusCodes.UNAUTHORIZED));
  }

  if (!eventId || !title || !description) {
    return next(
      new AppError(" title and description are required", StatusCodes.BAD_REQUEST)
    );
  }

  const newRequirement = await reqModel.create({
    eventId,
    posterId,
    title,
    description,
    tags: Array.isArray(tags) ? tags : [],
  });

  return res.status(StatusCodes.CREATED).json({
    status: "success",
    data: {
      requirement: newRequirement,
    },
  });
}

// Get all requirements 
export const getAllRequirementsOfEvent = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const { eventId } = req.params;
  
    if (!eventId) {
      return next(new AppError("Event ID is required", StatusCodes.BAD_REQUEST));
    }
  
    const requirements = await reqModel.find({ eventId }).sort({ createdAt: -1 });
  
    return res.status(StatusCodes.OK).json({
      status: "success",
      results: requirements.length,
      data: {
        requirements,
      },
    });
  };



// post or send new message 
  export const postMessage = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const { content } = req.body;
  const sender = req.user?.id;
  const { reqId } = req.params;

  // Check authentication
  if (!sender) {
    return next(new AppError("Unauthorized", StatusCodes.UNAUTHORIZED));
  }

  // Validate required fields
  if (!reqId || !content) {
    return next(
      new AppError("reqId and content are required", StatusCodes.BAD_REQUEST)
    );
  }

  // Create message
  const message = await msgModel.create({
    reqId,
    sender,
    content,
    isSeen: false,
  });

  // Aggregate to get message with sender's username
  const populatedMessage = await msgModel.aggregate([
    { $match: { _id: message._id } },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "senderInfo",
      },
    },
    { $unwind: "$senderInfo" },
    {
      $project: {
        _id: 1,
        reqId: 1,
        sender: {
          _id: "$senderInfo._id",
          username: "$senderInfo.username",
        },
        content: 1,
        parentMessage: 1,
        isSeen: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  // Emit to Socket.IO
  if (populatedMessage.length > 0) {
  handleNewMessage(io, reqId, populatedMessage); // Broadcast chat message
  }

  // Respond to client
  return res.status(StatusCodes.CREATED).json({
    status: "success",
    data: { message: populatedMessage[0] },
  });
};
  
// TWO Events
// 1. newMessage
// 2. joinRequirement

// Get Messages for a Requirement Thread
export const getMessagesForRequirement = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { reqId } = req.params;

  if (!reqId) {
    return next(new AppError("Requirement ID is required", StatusCodes.BAD_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(reqId)) {
    return next(new AppError("Invalid Requirement ID", StatusCodes.BAD_REQUEST));
  }

  const messages = await msgModel.aggregate([
    {
      $match: {
        reqId: new mongoose.Types.ObjectId(reqId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "senderInfo",
      },
    },
    { $unwind: "$senderInfo" },
    {
      $project: {
        _id: 1,
        reqId: 1,
        content: 1,
        parentMessage: 1,
        isSeen: 1,
        createdAt: 1,
        updatedAt: 1,
        sender: {
          _id: "$senderInfo._id",
          username: "$senderInfo.username",
        },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);

  return res.status(StatusCodes.OK).json({
    status: "success",
    results: messages.length,
    data: { messages },
  });
};

// Frontend ke liye  -->> 
// socket.emit("joinRequirement", "reqId");
// socket.on("newMessage", (msg) => console.log(msg));




