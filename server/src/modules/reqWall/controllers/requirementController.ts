import { Request, Response, NextFunction } from "express";
import { RequirementModel } from "../models/requirementModel";
import AppError from "../../../utils/appError";
import { ChatModel } from "../models/chatModel";
import mongoose from "mongoose";

export const createRequirement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventUserId = new mongoose.Types.ObjectId(String(req.eventUser?.id));
    const eventId = new mongoose.Types.ObjectId(String(req.eventUser?.eventId));
    const { title, description, budget, locationPreference } = req.body;

    if (!title || !description) {
      return next(new AppError("Title and description are required.", 400));
    }

    const newRequirement = await RequirementModel.create({
      title,
      description,
      budget,
      eventId,
      locationPreference,
      postedBy: eventUserId,
    });

    res.status(201).json({
      success: true,
      data: newRequirement,
    });
  } catch (error) {
    console.log("Error creating requirement :", error);
    next(new AppError("Internal server error", 500));
  }
};

export const fetchRequirements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventUserId = new mongoose.Types.ObjectId(String(req.eventUser?.id));
    const eventId = new mongoose.Types.ObjectId(String(req.eventUser?.eventId));

    const { type, page = "1", limit = "10", search } = req.query;

    if (!type || !["all", "postedByMe"].includes(type.toString())) {
      return next(new AppError("Invalid type parameter", 400));
    }

    const pageNumber = parseInt(page.toString(), 10);
    const limitNumber = parseInt(limit.toString(), 10);

    if (pageNumber < 1) {
      return next(new AppError("Page number must be greater than 0", 400));
    }

    if (limitNumber < 1 || limitNumber > 50) {
      return next(new AppError("Limit must be between 1 and 50", 400));
    }

    const skip = (pageNumber - 1) * limitNumber;

    let filter: any = {};
    filter.eventId = eventId;
    if (type === "postedByMe") {
      filter.postedBy = eventUserId;
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      const matchingEventUsers = await RequirementModel.aggregate([
        {
          $lookup: {
            from: "eventusers",
            localField: "postedBy",
            foreignField: "_id",
            as: "postedByUser",
          },
        },
        {
          $unwind: "$postedByUser",
        },
        {
          $match: {
            $or: [
              { title: { $regex: searchRegex } },
              { description: { $regex: searchRegex } },
              { "postedByUser.name": { $regex: searchRegex } },
            ],
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);

      const matchingIds = matchingEventUsers.map((item) => item._id);

      if (matchingIds.length > 0) {
        filter._id = { $in: matchingIds };
      } else {
        filter._id = { $in: [] };
      }
    }

    // Build aggregation pipeline to include membersCount and bidder profile images
    const aggregationPipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: "chats",
          localField: "_id",
          foreignField: "requirementId",
          as: "chats",
        },
      },
      {
        $lookup: {
          from: "eventusers",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedByUser",
        },
      },
      {
        $unwind: "$postedByUser",
      },
      {
        $lookup: {
          from: "eventusers",
          localField: "chats.bidderId",
          foreignField: "_id",
          as: "bidders",
        },
      },
      {
        $addFields: {
          membersCount: { $size: "$chats" },
          bidderProfileImages: {
            $slice: [
              {
                $map: {
                  input: "$bidders",
                  as: "bidder",
                  in: "$$bidder.profileImage",
                },
              },
              3,
            ],
          },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          budget: 1,
          locationPreference: 1,
          eventId: 1,
          createdAt: 1,
          updatedAt: 1,
          postedBy: {
            _id: "$postedByUser._id",
            profileImage: "$postedByUser.profileImage",
            name: "$postedByUser.name",
          },
          membersCount: 1,
          bidderProfileImages: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNumber },
    ];

    const requirements = await RequirementModel.aggregate(aggregationPipeline);

    const totalCount = await RequirementModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;

    res.status(200).json({
      success: true,
      data: requirements,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalCount,
        hasNextPage,
        limit: limitNumber,
      },
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

export const fetchRequirementById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const eventUserId = new mongoose.Types.ObjectId(String(req.eventUser?.id));

    const requirement = await RequirementModel.findById(id)
      .populate("postedBy", "profileImage name")
      .lean();

    if (!requirement) {
      return next(new AppError("Requirement not found", 404));
    }

    const isUserPosted =
      String(eventUserId) === String((requirement.postedBy as any)._id);
    let responses;
    let myResponse;

    if (isUserPosted) {
      responses = await ChatModel.find({ requirementId: id })
        .populate("bidderId", "profileImage name position")
        .lean();
    } else {
      myResponse = await ChatModel.findOne({
        requirementId: id,
        bidderId: eventUserId,
      })
        .select("_id")
        .lean();
    }

    const requirementData = {
      ...requirement,
      responses,
      isUserPosted,
      myResponse,
    };

    res.status(200).json({
      success: true,
      data: requirementData,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};
