import { NotificationEnum } from "../types/notificationEnums";
import mongoose from "mongoose";
import { INotification, NotificationModel } from "../models/notificationModel";

interface NotificationArgs {
    userId: string;
    type: NotificationEnum;
    message: string;
    reference?: string;
}

export const createNotification = async ({
    userId,
    type,
    message,
    reference
}: NotificationArgs): Promise<INotification | void> => {

    try {
        const notification = await NotificationModel.create({
            userId: new mongoose.Types.ObjectId(String(userId)),
            type,
            message,
            reference: new mongoose.Types.ObjectId(String(reference)),
        });
        return notification;
    }
    catch (error: any) {

        throw error;
    }
}