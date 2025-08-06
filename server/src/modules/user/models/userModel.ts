import { Model, Schema, model } from "mongoose";
import { AccountStatusEnum } from "../types/userEnums";

export interface IUser extends Document {
  name: string;
  email: string;
  status: AccountStatusEnum;
  emailVerified: boolean;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatusEnum),
      required: true,
      default: AccountStatusEnum.ACTIVE,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// model for the user
export const UserModel: Model<IUser> = model<IUser>("User", UserSchema);

// Changes can be made
// eventIds: Schema.Types.ObjectId[];

// already reg -->> email otp
