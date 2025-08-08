import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import AppError from "../../../utils/appError";
import { RecentSearchModel } from "../models/recentSearchModel";
import { EventUserModel } from "../../event/models/eventUsersModel";

const SEARCH_LIMIT = 15;

export const addSearchHistory = async (req: Request,res: Response,next: NextFunction) => {

    const eventUserId = req.eventUser?.id;
    const { searchedUserId } = req.query;

    if (!searchedUserId)
        throw new AppError("Query(searchedUserId) not found", 400);

    let recentSearches = await RecentSearchModel.findOne({ userId: new mongoose.Types.ObjectId(String(eventUserId)) });

    // user not found then create, else unshift the searches with limits 15
    if (!recentSearches) {
        recentSearches = new RecentSearchModel({
            userId: new mongoose.Types.ObjectId(String(eventUserId)),
            searches: [
                {
                    searchedUserId: new mongoose.Types.ObjectId(String(searchedUserId)),
                    timeStamps: Date.now()
                }
            ]
        })
    }
    else {
        const existingSearchIndex = recentSearches.searches.findIndex((search) => {
            search.searchedUserId.toString() === searchedUserId.toString()
        });

        if (existingSearchIndex !== -1) {
            recentSearches.searches[existingSearchIndex].timeStamps = new Date();
        }
        else {
            recentSearches.searches.unshift({
                searchedUserId: new mongoose.Types.ObjectId(String(searchedUserId)),
                timeStamps: new Date()
            })
        }

        // storing only latest 15 searches
        if (recentSearches.searches.length > SEARCH_LIMIT) {
            recentSearches.searches = recentSearches.searches.slice(0, SEARCH_LIMIT);
        }
    }

    const searches = await recentSearches.save();

    if (!searches) {
        throw new AppError("Search history not updated", 500);
    }

    return res.status(200).json({
        success: true,
        message: "Search history updated successfully",
        searches
    })
}

export const getSearchedUser = async (req: Request,res: Response,next: NextFunction) => {

    const eventUserId = req.eventUser?.id;

    const recentSearches = await RecentSearchModel.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(String(eventUserId))
            }
        },
        {
            $unwind: "$searches"
        },
        {
            $sort: { "searches.timeStamps": -1 }
        },
        {
            $lookup: {
                from: "eventusers",
                localField: "searches.searchedUserId",
                foreignField: "_id",
                as: "eventUser"
            }
        },
        {
            $unwind: "$eventUser"
        },
        {
            $project: {
                _id: "$eventUser._id",
                name: "$eventUser.name",
                profession: "$eventUser.profession",
                position: "$eventUser.position",
                company: "$eventUser.company",
                instituteName: "$eventUser.instituteName",
                profileImage: "$eventUser.profileImage",
                timeStamps: "$searches.timeStamps"
            }
        }
    ]);

    if (!recentSearches.length)
        return res.status(204).send();

    return res.status(200).json({
        success: true,
        message: "Recent searches fetched successfully",
        recentSearches
    })
}

export const clearAllSearch = async (req: Request,res: Response,next: NextFunction) => {

    const eventUserId = req.eventUser?.id;

    const result = await RecentSearchModel.deleteOne({
        userId: new mongoose.Types.ObjectId(String(eventUserId))
    });

    if (result.deletedCount > 0) {
        return res.status(200).json({
            success: true,
            message: "Search history deleted successfully"
        })
    }
    else {
        throw new AppError("Search history not found", 404);
    }
}

export const removeSearchedUser = async (req: Request,res: Response,next: NextFunction) => {
    
    const eventUserId = req.eventUser?.id;
    const { searchedUserId } = req.query;

    if (!searchedUserId)
        throw new AppError("Query(searchedUserId) not found", 400);

    const result = await RecentSearchModel.updateOne(
        { userId: new mongoose.Types.ObjectId(String(eventUserId)) },
        {
            $pull: {
                searches: {
                    searchedUserId: new mongoose.Types.ObjectId(String(searchedUserId))
                }
            }
        }
    );

    if (result.modifiedCount > 0) {
        return res.status(200).json({
            success: true,
            message: "Search history deleted successfully"
        })
    }
    else {
        throw new AppError("Search history not found", 404);
    }

}

