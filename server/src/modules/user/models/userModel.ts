import { Model, Schema, model } from "mongoose";
import { AccountStatusEnum } from "../types/userEnums";

interface ISocialLink {
  platform: string;
  url: string;
}

interface IService {
  name: string;
  description?: string;
  price?: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  contactNumber: string;
  profileImage: string;
  profession: string;
  position: string;
  industry: string[];
  help: string[];                                        
  company: string;
  instituteName: string;
  courseName:string;
  lookingFor: string[];
  interests: string[];
  badgeSplashRead:Boolean;
  previousBadgeName:String;
  status: AccountStatusEnum;
  refreshToken: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  emailVerified: boolean;

  profileBio: string;
  socialLinks: ISocialLink[];
  services: IService[];
}


const SocialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number },
  },
  { _id: false }
);

const UserSchema: Schema<IUser> = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim:true
  },
  contactNumber: {
    type: String,
    trim:true,
  },
  profileImage: {
    type: String
  },
  profession: {
    type: String,
    trim:true
  },
  position: {
    type: String,
    trim:true
  },
  industry: [
    {
      type: String,
      trim:true
    }
  ],
  help: [
    {
      type: String,
      trim:true,
    }
  ],
  company: {
    type: String,
    trim:true
  },
  instituteName: {
    type: String,
    trim:true
  },
  courseName:{
    type:String,
    trim:true
  },
  lookingFor: [
    {
      type: String,
      trim:true
    }
  ],
  interests: [
    {
      type: String,
      trim:true
    }
  ],
  badgeSplashRead:{
    type:Boolean,
    default:true,
  },
  previousBadgeName:{
    type:String,
    default:"Parmanu"
  },
  status: {
    type: String,
    enum: Object.values(AccountStatusEnum),
    required: true,
    default: AccountStatusEnum.ACTIVE
  },
  emailVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  refreshToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }, 
  profileBio : {
    type : String,
    default : null
  },
  socialLinks: { 
    type: [SocialLinkSchema], 
    default: [] 
  },
  services: { 
    type: [ServiceSchema], 
    default: [] 
  },
}, {
  timestamps: true
});

// model for the user
export const UserModel: Model<IUser> = model<IUser>("User", UserSchema);

// Changes can be made 
// eventIds: Schema.Types.ObjectId[];

// already reg -->> email otp
