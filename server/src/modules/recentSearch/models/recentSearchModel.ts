import mongoose, { Schema, Document } from "mongoose";

interface ISearch {
    searchedUserId: mongoose.Types.ObjectId; 
    timeStamps: Date; 
}

interface IRecentSearch extends Document {
    userId: Schema.Types.ObjectId; 
    searches: ISearch[]; 
}

const RecentSearchSchema: Schema<IRecentSearch> = new Schema<IRecentSearch>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "EventUser",
        required: true
    },
    searches: [
        {
            searchedUserId: {
                type: mongoose.Types.ObjectId,
                ref: "EventUser", 
                required: true
            },
            timeStamps: {
                type: Date, 
                default: Date.now 
            }
        }
    ]
});

export const RecentSearchModel = mongoose.model<IRecentSearch>("RecentSearch", RecentSearchSchema);