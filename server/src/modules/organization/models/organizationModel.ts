import { Model, Schema, model } from "mongoose";
import { GenderEnum, OrganizationEnum } from "../../organization/types/organizationEnums";

export interface IOrganization extends Document {
  name: string;
  description:string;
  email: string;
  password:string;
  designation:string;
  address:string;
  organizationType:OrganizationEnum
  contactNumber: string;
  logo:string;
  refreshToken:string;
  resetPasswordToken:string;
  resetPasswordExpires:Date;
}


const OrganizationSchema: Schema<IOrganization> = new Schema<IOrganization>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description:{
        type:String,
        // requied:true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required:true,
    },
    designation:{
        type:String,
    },
    address:{
        type:String,
    },
    organizationType:{
        type:String,
        enum:Object.values(OrganizationEnum),
        requied:true,
    },
    logo:{
        type:String
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
},
{
    timestamps:true,
});


export const OrganizationModel: Model<IOrganization> = model<IOrganization>("Organization", OrganizationSchema);