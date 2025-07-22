import { Request, Response, NextFunction } from "express";
import { NotificationModel } from "../models/notificationModel";
import mongoose from "mongoose";
import AppError from "../../../utils/appError";

export const getNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;
    const { cursor, limit = 20 } = req.query;

    const notification = await NotificationModel.aggregate([
        {
            $match: { userId: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "users",
                let: { referenceId: "$reference" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$referenceId"] }
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            profileImage: 1,
                            professiona: 1,
                            position: 1,
                        }
                    }
                ],
                as: "user"
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        ...(cursor ? [
            {
                $match: {
                    _id: { $gt: new mongoose.Types.ObjectId(String(cursor)) }
                }
            }
        ] : []),
        {
            $limit: parseInt(String(limit))
        },

        {
            $project: {
                _id: 1,
                type: 1,
                message: 1,
                reference: 1,
                isRead: 1,
                user: 1,
                createdAt:1,
            }
        },
    ]);

    if (!notification.length)
        return res.status(204).send();

    return res.status(200).json({
        success: true,
        message: "Notification fetched successfully",
        notification
    })
}

export const markNotificationRead = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;
    const { notificationId } = req.query;

    if (!notificationId)
        throw new AppError("Query(notifcatioId) not found", 400);

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(String(notificationId)),
        {
            $set: {
                isRead: true
            }
        },
        { new: true }
    );

    if (!updatedNotification)
        throw new AppError("Notification not found", 404);

    return res.status(200).json({
        success: true,
        message: "Notificatio status updated"
    })
}

export const deleteNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds))
        throw new AppError("notificationIds must be an array", 400);

    if (notificationIds.length === 0)
        throw new AppError("No notification IDs provided", 400);

    const result = await NotificationModel.deleteMany({
        _id: { $in: notificationIds },
    });

    if (result.deletedCount > 0) {
        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} notifications deleted successfully`
        })
    }
    else {
        return res.status(404).json({
            success: false,
            message: 'No matching notifications found to delete'
        });
    }

}