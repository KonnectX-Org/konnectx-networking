import { Model, Schema, model } from "mongoose";

export interface IEvent extends Document {
    name: string,
    description: string,
    type: string,
    startDate: Date,
    endDate: Date,
    venue: string,
    city: string,
    // country:string,
    banner: string,
    organizationId: Schema.Types.ObjectId;
    attendeeRoles:String[];
    publish:Boolean
}

const EventSchema: Schema<IEvent> = new Schema<IEvent>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description:{
        type:String,
        requied:true,
    },
    type:{
        type:String,
    },
    startDate:{
        type:Date, 
        required:true,
    },
    endDate:{
        type:Date,
        required:true,
    },
    venue:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        requied:true,
    },
    banner:{
        type:String,
    },
    organizationId:{
        type:Schema.Types.ObjectId,
        ref:'Organization',
        required:true,
    },
    attendeeRoles:[
        {
            type:String
        }
    ],
    publish:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});


export const EventModel: Model<IEvent> = model<IEvent>("Event", EventSchema);