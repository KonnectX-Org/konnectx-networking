import { Schema, model, Document, Types } from "mongoose";

export interface IReqThread extends Document {
  requirementId: Types.ObjectId;
  createdBy: Types.ObjectId; 

  
  createdAt: Date;
  updatedAt: Date;
}

const ReqThreadSchema = new Schema<IReqThread>(
  {
    requirementId: {
      type: Schema.Types.ObjectId,
      ref: "Requirement",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

export const ReqThreadModel = model<IReqThread>("ReqThread", ReqThreadSchema);
