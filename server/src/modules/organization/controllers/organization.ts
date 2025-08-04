import {Request, Response, NextFunction } from "express";
import AppError from "../../../utils/appError";
import { StatusCodes } from "http-status-codes";
import { OrganizationModel } from "../models/organizationModel";
import mongoose from "mongoose";


export const getOrganizationInfo =async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const organizationId = req.organization.id;

    if (!organizationId)
        throw new AppError("Not authenticated", 404);

    const organization = await OrganizationModel.aggregate([
        {
            $match: {_id: new mongoose.Types.ObjectId(organizationId)}
        },
        {
            $project:{
                _id:1,
                name:1,
                description:1,
                email:1,
                address:1,
                designation:1,
                contactNumber:1,
                logo:1,
                organizationType:1,
            }
        }
    ])
    if (!organization)
        throw new AppError("Organization not availabe", StatusCodes.NOT_FOUND);

    console.log("organization", organization);
    return res.status(200).json({
        success: true,
        organization
    });
}





export const updateOrganization = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {
    
    const { data } = req.body;
    const organizationId = req.organization.id;

    if (!data)
        throw new AppError("Feild required", StatusCodes.BAD_REQUEST);

    const updatedOrganization = await OrganizationModel.findByIdAndUpdate( new mongoose.Types.ObjectId(organizationId), data);
    if (!updatedOrganization)
        throw new AppError("Event not availabe", StatusCodes.NOT_FOUND);

    console.log("updatedEvent", updatedOrganization);
    return res.status(200).json({
        success: true,
        updatedOrganization
    });
}
