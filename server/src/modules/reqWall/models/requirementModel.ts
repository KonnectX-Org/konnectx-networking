import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IRequirement extends Document {
  title: string;
  eventId: Types.ObjectId;
  postedBy: Types.ObjectId;
  description: string;
  budget: number;
  locationPreference: string;
  biddersCount: number;
}

const RequirementSchema = new Schema<IRequirement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "EventUser",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    locationPreference: {
      type: String,
      trim: true,
    },
    biddersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const RequirementModel = model<IRequirement>(
  "Requirement",
  RequirementSchema
);
