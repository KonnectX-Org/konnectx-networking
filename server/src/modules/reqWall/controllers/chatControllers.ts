import { Request, Response, NextFunction } from "express";
import { ChatModel } from "../models/chatModel";
import { MessageModel } from "../models/messageModel";
import { RequirementModel } from "../models/requirementModel";
import AppError from "../../../utils/appError";
import asyncHandler from "../../../utils/asyncHandler";
import mongoose from "mongoose";

export const submitBid = asyncHandler(
  async (req: Request, res: Response) => {
    const eventUserId = req.eventUser?.id;
    const { requirementId, message } = req.body;

    if (!requirementId) {
      throw new AppError("Requirement ID is required", 400);
    }

    if (!message || message.trim() === "") {
      throw new AppError("Message is required", 400);
    }

    // Validate requirementId format
    if (!mongoose.Types.ObjectId.isValid(requirementId)) {
      throw new AppError("Invalid requirement ID format", 400);
    }

    const requirement = await RequirementModel.findById(requirementId);
    if (!requirement) {
      throw new AppError("Requirement not found", 404);
    }

    if (requirement.postedBy.toString() === eventUserId) {
      throw new AppError("You cannot bid on your own requirement", 400);
    }

    // Check if user has already submitted a bid for this requirement
    const existingChat = await ChatModel.findOne({
      requirementId,
      bidderId: eventUserId,
      postedBy: requirement.postedBy,
    });

    if (existingChat) {
      throw new AppError("You have already submitted a bid for this requirement", 400);
    }

    // Use a session for transaction to ensure data consistency
    const session = await mongoose.startSession();
    
    let createdChat: any;
    let createdMessage: any;
    
    try {
      await session.withTransaction(async () => {
        const currentTime = new Date();
        
        // Create new chat with lastActivity
        const newChat = await ChatModel.create([{
          requirementId,
          postedBy: requirement.postedBy,
          bidderId: eventUserId,
          lastActivity: currentTime,
          unreadCount: {
            postedBy: 1, // New message for the requirement poster
            bidder: 0,
          },
        }], { session });

        // Create the first message
        const firstMessage = await MessageModel.create([{
          chatId: newChat[0]._id,
          senderId: eventUserId,
          text: message.trim(),
          attachments: [],
        }], { session });

        // Update the requirement's biddersCount
        await RequirementModel.findByIdAndUpdate(
          requirementId,
          { $inc: { biddersCount: 1 } },
          { session }
        );

        // Store the created objects for response
        createdChat = newChat[0];
        createdMessage = firstMessage[0];
      });

      // Populate the message after transaction
      const populatedMessage = await MessageModel.findById(createdMessage._id)
        .populate("senderId", "name profileImage")
        .lean();

      res.status(201).json({
        success: true,
        message: "Bid submitted successfully",
        data: {
          chat: createdChat,
          firstMessage: populatedMessage,
        },
      });
    } finally {
      await session.endSession();
    }
  }
);

export const sendMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const eventUserId = req.eventUser?.id;
    const { chatId } = req.params;
    const { message } = req.body;

    if (!chatId) {
      throw new AppError("Chat ID is required", 400);
    }

    if (!message || message.trim() === "") {
      throw new AppError("Message is required", 400);
    }

    // Validate chatId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new AppError("Invalid chat ID format", 400);
    }

    // Find the chat and verify user is authorized
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      throw new AppError("Chat not found", 404);
    }

    // Check if user is either the poster or the bidder
    const isAuthorized = 
      chat.postedBy.toString() === eventUserId || 
      chat.bidderId.toString() === eventUserId;

    if (!isAuthorized) {
      throw new AppError("You are not authorized to send messages in this chat", 403);
    }

    const currentTime = new Date();

    // Use session for transaction
    const session = await mongoose.startSession();
    
    let createdMessage: any;
    
    try {
      await session.withTransaction(async () => {
        // Create the message
        const newMessage = await MessageModel.create([{
          chatId,
          senderId: eventUserId,
          text: message.trim(),
          attachments: [],
        }], { session });

        // Determine who gets the unread count increment
        const isPostedBySender = chat.postedBy.toString() === eventUserId;
        const updateQuery = isPostedBySender 
          ? { $inc: { "unreadCount.bidder": 1 } }
          : { $inc: { "unreadCount.postedBy": 1 } };

        // Update chat lastActivity and unread count
        await ChatModel.findByIdAndUpdate(
          chatId,
          {
            lastActivity: currentTime,
            ...updateQuery,
          },
          { session }
        );

        createdMessage = newMessage[0];
      });

      // Populate the message after transaction
      const populatedMessage = await MessageModel.findById(createdMessage._id)
        .populate("senderId", "name profileImage")
        .lean();

      // Format the response to match frontend expectations
      const messageData = populatedMessage as any;
      const senderData = messageData?.senderId as any;
      
      const formattedMessage = {
        _id: messageData?._id,
        text: messageData?.text,
        attachments: messageData?.attachments || [],
        createdAt: messageData?.createdAt,
        senderId: senderData?._id || messageData?.senderId,
        isOwnMessage: true, // This is always true for sendMessage since current user is sending
        sender: {
          id: senderData?._id || messageData?.senderId,
          name: senderData?.name || "Unknown User",
          profileImage: senderData?.profileImage || null,
        },
      };

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: formattedMessage,
      });
    } finally {
      await session.endSession();
    }
  }
);

export const fetchChatMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const eventUserId = req.eventUser?.id;
    const { chatId } = req.params;
    const { cursor, limit = "20" } = req.query;

    if (!chatId) {
      throw new AppError("Chat ID is required", 400);
    }

    // Validate chatId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new AppError("Invalid chat ID format", 400);
    }

    const messageLimit = Math.min(parseInt(limit as string) || 20, 50); // Max 50 messages per request

    // Find the chat and verify user is authorized
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      throw new AppError("Chat not found", 404);
    }

    // Check if user is either the poster or the bidder
    const isAuthorized = 
      chat.postedBy.toString() === eventUserId || 
      chat.bidderId.toString() === eventUserId;

    if (!isAuthorized) {
      throw new AppError("You are not authorized to view this chat", 403);
    }

    // Build aggregation pipeline for cursor-based pagination
    const matchStage: any = { chatId: new mongoose.Types.ObjectId(chatId) };
    
    // If cursor is provided, fetch messages older than the cursor (for infinite scroll)
    if (cursor) {
      if (!mongoose.Types.ObjectId.isValid(cursor as string)) {
        throw new AppError("Invalid cursor format", 400);
      }
      
      // Find the timestamp of the cursor message
      const cursorMessage = await MessageModel.findById(cursor).lean();
      if (cursorMessage) {
        matchStage.createdAt = { $lt: (cursorMessage as any).createdAt };
      }
    }

    const messages = await MessageModel.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } }, // Latest first for pagination
      { $limit: messageLimit + 1 }, // Fetch one extra to check if there are more
      {
        $lookup: {
          from: "eventusers",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
          pipeline: [
            {
              $project: {
                name: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$sender",
          preserveNullAndEmptyArrays: true, // This prevents the pipeline from failing if sender is not found
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          attachments: 1,
          createdAt: 1,
          senderId: 1,
          isOwnMessage: {
            $eq: ["$senderId", new mongoose.Types.ObjectId(eventUserId)],
          },
          sender: {
            $cond: {
              if: { $ne: ["$sender", null] },
              then: {
                id: "$sender._id",
                name: "$sender.name",
                profileImage: { $ifNull: ["$sender.profileImage", null] },
              },
              else: {
                id: "$senderId",
                name: "Unknown User",
                profileImage: null,
              },
            },
          },
        },
      },
      { $sort: { createdAt: 1 } }, // Chronological order for display (oldest first)
    ]);

    // Check if there are more messages
    const hasNextPage = messages.length > messageLimit;
    if (hasNextPage) {
      messages.pop(); // Remove the extra message
    }

    // Get the next cursor (oldest message's ID in the current batch)
    const nextCursor = hasNextPage && messages.length > 0 
      ? messages[0]._id.toString() 
      : null;

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          hasNextPage,
          nextCursor,
          limit: messageLimit,
        },
      },
    });
  }
);

export const markMessagesAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const eventUserId = req.eventUser?.id;
    const { chatId } = req.params;

    if (!chatId) {
      throw new AppError("Chat ID is required", 400);
    }

    // Validate chatId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new AppError("Invalid chat ID format", 400);
    }

    // Find the chat and verify user is authorized
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      throw new AppError("Chat not found", 404);
    }

    // Check if user is either the poster or the bidder
    const isAuthorized = 
      chat.postedBy.toString() === eventUserId || 
      chat.bidderId.toString() === eventUserId;

    if (!isAuthorized) {
      throw new AppError("You are not authorized to access this chat", 403);
    }

    // Determine which unread count to reset
    const isPostedByUser = chat.postedBy.toString() === eventUserId;
    const updateQuery = isPostedByUser 
      ? { "unreadCount.postedBy": 0 }
      : { "unreadCount.bidder": 0 };

    // Update the unread count
    await ChatModel.findByIdAndUpdate(chatId, updateQuery);

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  }
);
