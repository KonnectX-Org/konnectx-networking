import { Schema, model, Document } from "mongoose";

export interface IAttachment {
  type: "image" | "pdf";
  url: string;
}

export interface IMessage extends Document {
  chatId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  attachments: IAttachment[];
  text?: string;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    type: {
      type: String,
      enum: ["image", "pdf"],
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "EventUser",
      required: true,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    text: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = model<IMessage>("Message", MessageSchema);
