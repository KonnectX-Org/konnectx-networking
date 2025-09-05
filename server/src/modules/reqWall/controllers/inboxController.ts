import { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler";
import AppError from "../../../utils/appError";
import { RequirementModel } from "../models/requirementModel";
import { ChatModel } from "../models/chatModel";
import mongoose from "mongoose";

export const fetchInboxPostedByMe = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.eventUser) {
      throw new AppError("Authentication required", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const eventUserId = new mongoose.Types.ObjectId(String(req.eventUser.id));

    const requirements = await RequirementModel.find({
      postedBy: eventUserId,
      biddersCount: { $gt: 0 },
    }).select("_id title biddersCount createdAt");

    if (requirements.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          inboxItems: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      });
    }

    const requirementIds = requirements.map((req) => req._id);

    const latestChatsAggregation = await ChatModel.aggregate([
      {
        $match: {
          requirementId: { $in: requirementIds },
          postedBy: eventUserId,
        },
      },
      {
        $sort: { lastActivity: -1 },
      },
      {
        $group: {
          _id: "$requirementId",
          latestChat: { $first: "$$ROOT" },
        },
      },
      {
        $sort: { "latestChat.lastActivity": -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "requirements",
          localField: "_id",
          foreignField: "_id",
          as: "requirement",
        },
      },
      {
        $lookup: {
          from: "eventusers",
          localField: "latestChat.bidderId",
          foreignField: "_id",
          as: "bidder",
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
        $unwind: "$requirement",
      },
      {
        $unwind: "$bidder",
      },
      {
        $project: {
          _id: 0,
          chatId: "$latestChat._id",
          requirementId: "$_id",
          title: "$requirement.title",
          biddersCount: "$requirement.biddersCount",
          lastActivity: "$latestChat.lastActivity",
          unreadCount: "$latestChat.unreadCount.postedBy",
          bidder: {
            id: "$bidder._id",
            name: "$bidder.name",
            profileImage: "$bidder.profileImage",
          },
          createdAt: "$requirement.createdAt",
        },
      },
    ]);

    const totalChatsAggregation = await ChatModel.aggregate([
      {
        $match: {
          requirementId: { $in: requirementIds },
          postedBy: eventUserId,
        },
      },
      {
        $group: {
          _id: "$requirementId",
        },
      },
      {
        $count: "total",
      },
    ]);

    const total =
      totalChatsAggregation.length > 0 ? totalChatsAggregation[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        inboxItems: latestChatsAggregation,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  }
);

export const fetchInboxAll = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.eventUser) {
      throw new AppError("Authentication required", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const eventUserId = new mongoose.Types.ObjectId(String(req.eventUser.id));

    const chatsAggregation = await ChatModel.aggregate([
      {
        $match: {
          bidderId: eventUserId,
        },
      },
      {
        $sort: { lastActivity: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "requirements",
          localField: "requirementId",
          foreignField: "_id",
          as: "requirement",
        },
      },
      {
        $lookup: {
          from: "eventusers",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedByUser",
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
        $unwind: "$requirement",
      },
      {
        $unwind: "$postedByUser",
      },
      {
        $project: {
          _id: 0,
          chatId: "$_id",
          requirementId: "$requirementId",
          title: "$requirement.title",
          biddersCount: "$requirement.biddersCount",
          lastActivity: "$lastActivity",
          unreadCount: "$unreadCount.bidder",
          postedBy: {
            id: "$postedByUser._id",
            name: "$postedByUser.name",
            profileImage: "$postedByUser.profileImage",
          },
          createdAt: "$requirement.createdAt",
        },
      },
    ]);

    const totalCount = await ChatModel.countDocuments({
      bidderId: eventUserId,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        inboxItems: chatsAggregation,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  }
);

export const fetchRequirementChats = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.eventUser) {
      throw new AppError("Authentication required", 401);
    }

    const { requirementId } = req.params;
    
    if (!requirementId) {
      throw new AppError("Requirement ID is required", 400);
    }

    const eventUserId = new mongoose.Types.ObjectId(String(req.eventUser.id));
    const reqId = new mongoose.Types.ObjectId(requirementId);

    // First verify that the requirement exists and is posted by the current user
    const requirement = await RequirementModel.findOne({
      _id: reqId,
      postedBy: eventUserId,
    });

    if (!requirement) {
      throw new AppError("Requirement not found or not authorized", 404);
    }

    // Fetch all chats for this requirement ordered by latest activity
    const chatsAggregation = await ChatModel.aggregate([
      {
        $match: {
          requirementId: reqId,
          postedBy: eventUserId,
        },
      },
      {
        $sort: { lastActivity: -1 },
      },
      {
        $lookup: {
          from: "eventusers",
          localField: "bidderId",
          foreignField: "_id",
          as: "bidder",
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
        $unwind: "$bidder",
      },
      {
        $project: {
          _id: 0,
          chatId: "$_id",
          bidderId: "$bidderId",
          bidder: {
            id: "$bidder._id",
            name: "$bidder.name",
            profileImage: "$bidder.profileImage",
          },
          lastActivity: "$lastActivity",
          unreadCount: "$unreadCount.postedBy",
          createdAt: "$createdAt",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        requirementId: reqId,
        requirementTitle: requirement.title,
        totalChats: chatsAggregation.length,
        chats: chatsAggregation,
      },
    });
  }
);

// New endpoint to get total unread counts for badges
export const getTotalUnreadCounts = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.eventUser) {
      throw new AppError("Authentication required", 401);
    }

    const eventUserId = new mongoose.Types.ObjectId(String(req.eventUser.id));

    // Get total unread count for "Posted by Me" (requirements posted by user)
    const postedByMeUnreadAggregation = await ChatModel.aggregate([
      {
        $match: {
          postedBy: eventUserId,
          "unreadCount.postedBy": { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalUnread: { $sum: "$unreadCount.postedBy" }
        }
      }
    ]);

    // Get total unread count for "All" (requirements where user is bidder)
    const allUnreadAggregation = await ChatModel.aggregate([
      {
        $match: {
          bidderId: eventUserId,
          "unreadCount.bidder": { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalUnread: { $sum: "$unreadCount.bidder" }
        }
      }
    ]);

    const postedByMeUnread = postedByMeUnreadAggregation.length > 0 
      ? postedByMeUnreadAggregation[0].totalUnread 
      : 0;
    
    const allUnread = allUnreadAggregation.length > 0 
      ? allUnreadAggregation[0].totalUnread 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        postedByMeUnread,
        allUnread,
        totalUnread: postedByMeUnread + allUnread
      }
    });
  }
);
