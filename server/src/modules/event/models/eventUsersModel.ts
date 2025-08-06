import { Schema, model, Document } from "mongoose";

export interface IEventUser extends Document {
  userId: Schema.Types.ObjectId;
  eventId: Schema.Types.ObjectId;
  isCheckedIn: boolean;
  checkedInAt?: Date;

  // Authentication fields for event-specific login
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date | null;
  otp?: string | null;
  otpExpiry?: Date | null;

  // Event-specific profile fields (moved from UserModel)
  contactNumber?: string;
  profileImage?: string;
  profession?: string;
  position?: string;
  industry: string[];
  help?: string[];
  company?: string;
  instituteName?: string;
  courseName?: string;
  lookingFor?: string[];
  interests?: string[];
  badgeSplashRead: boolean;
  previousBadgeName: string;
  profileBio?: string;
  socialLinks: ISocialLink[];
  services: IService[];
  lookingToConnectWith: string[];
}

interface ISocialLink {
  type: string;
  url: string;
}

interface IService {
  name: string;
  description?: string;
  price?: number;
}

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    type: { type: String, required: true, trim: true },
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

    // Authentication fields for event-specific login
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },

    // Event-specific profile fields
    contactNumber: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    profession: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    industry: {
      type: [String], 
      default: [],
      ref: "Industry",
    },
    help: [
      {
        type: String,
        trim: true,
      },
    ],
    company: {
      type: String,
      trim: true,
    },
    instituteName: {
      type: String,
      trim: true,
    },
    courseName: {
      type: String,
      trim: true,
    },
    lookingFor: [
      {
        type: String,
        trim: true,
      },
    ],
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    badgeSplashRead: {
      type: Boolean,
      default: true,
    },
    previousBadgeName: {
      type: String,
      default: "Parmanu",
    },
    profileBio: {
      type: String,
      default: null,
    },
    socialLinks: {
      type: [SocialLinkSchema],
      default: [],
    },
    services: {
      type: [ServiceSchema],
      default: [],
    },
    lookingToConnectWith: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one EventUser record per user per event
EventUserSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const EventUserModel = model<IEventUser>("EventUser", EventUserSchema);
