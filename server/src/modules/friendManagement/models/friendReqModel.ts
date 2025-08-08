import { Model, Schema, model } from "mongoose";
import { RequestStatusEnum } from "../types/friendManagementEnums";

export interface IFriendRequest extends Document {
  sender:Schema.Types.ObjectId,
  receiver:Schema.Types.ObjectId,
  note:string,
  video: string,
  status:RequestStatusEnum,
  sentAt:Date,
  respondedAt:Date
}


const FriendRequestSchema: Schema<IFriendRequest> = new Schema<IFriendRequest>({
  sender: {
    type: Schema.Types.ObjectId,
    ref:'EventUser',
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref:'EventUser',
    required: true,
  },
  note:{
    type:String,
  },
  video:{
    type:String,
  },
  status:{
    type:String,
    enum:Object.values(RequestStatusEnum),
    default:RequestStatusEnum.PENDING
  },
  sentAt:{
    type:Date,
    required:true,
    default: Date.now()
  },
  respondedAt:{
    type:Date,
    requierd:true
  }
},{
  timestamps:true
});

export const FriendRequestModel: Model<IFriendRequest> = model<IFriendRequest>("FriendRequest", FriendRequestSchema);