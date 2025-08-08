import { Model, Schema, model } from "mongoose";

export interface IFriends extends Document {
  user1:Schema.Types.ObjectId,
  user2:Schema.Types.ObjectId,
}

const FriendSchema : Schema<IFriends> = new Schema<IFriends>({
  user1:{
    type: Schema.Types.ObjectId,
    ref:'EventUser',
    required:true,
  },
  user2:{
    type: Schema.Types.ObjectId,
    ref:'EventUser',
    required:true,
  }
},{
  timestamps:true
});

export const FriendModel : Model<IFriends> = model<IFriends>("Friend", FriendSchema);