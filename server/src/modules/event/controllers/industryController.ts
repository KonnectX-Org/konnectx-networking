import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/appError";
import { IndustryModel as industryModel } from "../models/industryModel";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

// getIndustryTree
export const getIndustryTree = async (req: Request, res: Response): Promise<void> => {
    const rootIndustries = await industryModel.find({ parentId: null }).select("taxoId name");
    res.status(200).json(rootIndustries);
};
  
  
// searchIndustries
export const searchIndustries = async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.q as string)?.trim() || "";

    if (query.length < 2) {
        res.status(400).json({ message: "Search query too short" });
        return;
    }

    const industries = await industryModel.find({
        name: { $regex: query, $options: "i" },
    })
        .limit(15)
        .select("taxoId name");

    res.status(200).json(industries);
};

