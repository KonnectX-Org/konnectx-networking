import { Schema, model, Document } from "mongoose";

export interface IEventUser extends Document {
  userId: Schema.Types.ObjectId;
  eventId: Schema.Types.ObjectId;
  isCheckedIn: boolean;
  checkedInAt?: Date;

  role: string;
  industry: number; // inked to Industry.taxoId
  lookingToConnectWith: string[];
}

const EventUserSchema = new Schema<IEventUser>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },

    // Updated Fields
    role: {
      type: String,
      required: true,
    },
    industry: {
      type: Number, //  refers to Industry.taxoId
      required: true,
      ref: "Industry",
    },
    lookingToConnectWith: {
      type: [String]
    },
  },
  {
    timestamps: true,
  }
);

export const EventUserModel = model<IEventUser>("EventUser", EventUserSchema);
