import { Schema, model, Document } from "mongoose";

export interface IChat extends Document {
  requirementId: Schema.Types.ObjectId;
  postedBy: Schema.Types.ObjectId;
  bidderId: Schema.Types.ObjectId;
  lastActivity: Date;
  unreadCount: {
    postedBy: number;
    bidder: number;
  };
}

const ChatSchema = new Schema<IChat>(
  {
    requirementId: {
      type: Schema.Types.ObjectId,
      ref: "Requirement",
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "EventUser",
      required: true,
    },
    bidderId: {
      type: Schema.Types.ObjectId,
      ref: "EventUser",
      required: true,
    },
    lastActivity: {
      type: Date,
      required: true,
    },
    unreadCount: {
      postedBy: {
        type: Number,
        default: 0,
      },
      bidder: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

ChatSchema.index({postedBy:1,lastActivity:-1});
ChatSchema.index({bidderId:1,lastActivity:-1}); 

export const ChatModel = model<IChat>("Chat", ChatSchema);
