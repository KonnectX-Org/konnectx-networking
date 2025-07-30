import { Schema, model, Document, Types } from "mongoose";

export interface IRequirement extends Document {
  posterId: Types.ObjectId;
  eventId: Types.ObjectId;
  title: string;
  description: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReqSchema = new Schema<IRequirement>(
  {
    posterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event", 
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
    ]
  },
  { timestamps: true }
);

export const ReqModel = model<IRequirement>("Requirement", ReqSchema);
