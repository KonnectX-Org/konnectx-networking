import { Schema, model, Document, Types } from "mongoose";

export enum ReqTypeEnum {
  ASK = "ASK",          // asking for help/advice/service
  OFFER = "OFFER",      // offering help/service
}

export interface IReqWall extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  tags: string[];
  type: ReqTypeEnum;
  createdAt: Date;
  updatedAt: Date;
}

const ReqWallSchema = new Schema<IReqWall>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    type: {
      type: String,
      enum: Object.values(ReqTypeEnum),
      required: true,
    },
  },
  { timestamps: true }
);

export const ReqWallModel = model<IReqWall>("ReqWall", ReqWallSchema);
