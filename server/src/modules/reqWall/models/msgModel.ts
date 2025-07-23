import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  reqId : Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  parentMessage?: Types.ObjectId;
  isSeen : boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReqMessageSchema = new Schema<IMessage>(
  {
    reqId : {
      type : Schema.Types.ObjectId, 
      ref : "Requirement",
      required : true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    parentMessage: {
      type: Schema.Types.ObjectId,
      ref: "ReqMessage",
      default: null,
    },
    isSeen: {
        type: Boolean,
        default: false,
      }
  },
  { timestamps: true }
);

export const ReqMessageModel = model<IMessage>("Message", ReqMessageSchema);
