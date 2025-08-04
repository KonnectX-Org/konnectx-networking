import {Request, Response, NextFunction } from "express";
import AppError from "../../../utils/appError";
import { EventModel } from "../models/eventModel";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

// API'S
// createEvent
// getAllEvents
// getEventById
// updateEvent
// deleteEvent
// handlePublishQR
// updateAttendeeRoles

// createEvent
export const createEvent = async(req:Request,res:Response,next:NextFunction):Promise<Response|void> =>{

    let {data} = req.body
    const organizationId = req.organization.id;

    console.log("organizatioId", organizationId)

    if(!data.name || !data.type || !data.startDate || !data.endDate || !data.venue || !data.city)
        throw new AppError("Field requiresd", 400);

    data = {
        ...data,
        organizationId: new mongoose.Types.ObjectId(organizationId)
    }

    const event = await EventModel.create(data);
    if(!event)
        throw new AppError("Failed to create event", 500);

    return res.status(200).json({
        success:true, 
        event
    });
}



// Get All events of an organization
export const getAllEvents = async (req: Request, res: Response,next: NextFunction): Promise<Response | void> => {

    const {name, sortOrder } = req.query;
    const organizationId = req.organization.id;

    // const events = await model.find(EventModel, { projectId });
    const events = await EventModel.aggregate([
        {
            $match: { 
                organizationId:new mongoose.Types.ObjectId(organizationId),
                ...(name ? { name: { $regex: name, $options: 'i' } } : {})
            }
        },
        {
            $sort: { createdAt: sortOrder === 'asc' ? 1 : -1 }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                startDate:1,
                endDate:1,
                venue:1,
                city:1,
                publish: 1,
                createdAt: 1,
            }
        }
    ]);

    console.log("events",events)
    if (!events.length)
        throw new AppError("Events not available", StatusCodes.NO_CONTENT);

    console.log("events", events);
    return res.status(200).json({
        success: true,
        events
    });
}


// getEventById
export const getEventById = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {
    const {eventId } = req.query;
    const organizationId = req.organization.id;

    const event = await EventModel.findOne({ _id: eventId, organizationId });
    if (!event)
        throw new AppError("Event not availabe", StatusCodes.NOT_FOUND);

    console.log("event", event);
    return res.status(200).json({
        success: true,
        event
    });
}




// updateEvent
export const updateEvent = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const { data } = req.body;
    const organizationId = req.organization.id;

    if (!data.eventId)
        throw new AppError("Event not found", StatusCodes.BAD_REQUEST);

    const updatedEvent = await EventModel.findOneAndUpdate({ _id: data.eventId, organizationId}, data);
    if (!updatedEvent)
        throw new AppError("Event not availabe", StatusCodes.NOT_FOUND);

    console.log("updatedEvent", updatedEvent);
    return res.status(200).json({
        success: true,
        updatedEvent
    });
}


// deleteEvent
// isme eventUser ke vo saare delete , jo jo is event me the 
export const deleteEvent = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {
    const { eventId } = req.query;
    const organizationId = req.organization.id;

    if (!eventId)
        throw new AppError("Query not found", StatusCodes.BAD_REQUEST);

    const event = await EventModel.deleteOne({ _id: eventId, organizationId });
    if (!event)
        throw new AppError("Event not deleted", StatusCodes.NOT_FOUND);

    console.log("event", event);
    return res.status(200).json({
        success: true,
        event
    });
}


// handlePublishQR
export const handlePublishQR = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {

    const organizationId = req.organization.id;
    const {eventId } = req.query;

    if (!eventId)
        throw new AppError("Query not found", 400);

    const updatedEvent = await EventModel.findOneAndUpdate(
        { _id: eventId, organizationId },
        [{
            $set: { publish: { $eq: ["$publish", false] } }
        }],
        { new: true }
    );

    if (!updatedEvent)
        throw new AppError("Publish QR Status not Updated", 404);

    return res.status(200).json({
        success: true,
        updatedEvent
    })
}



//  Attend karne wale users ke roles kya kya ho sakte hai ....
// updateAttendeeRoles
export const updateAttendeeRoles = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    const organizatioId = req.organization.id;
    const { data } = req.body;

    if(!data.eventId)
        throw new AppError("Eventd not found", 400);

    if (!data.attendeeRolesToRemove.length && !data.newAttendeeRoles.length)
        throw new AppError("Field not found", 400);

    // pulls attendeeRoles
    if (data.attendeeRolesToRemove.length) {
        await EventModel.updateOne(
            { _id: new mongoose.Types.ObjectId(data.eventId) },
            { 
                $pull: { attendeeRoles: { $in: data.attendeeRolesToRemove } } 
            }
        );
    }

    // push attendeeRoles
    if (data.newAttendeesRole.length) {
        await EventModel.updateOne(
            { _id: new mongoose.Types.ObjectId(data.eventId) },
            { 
                $push: { attendeeRoles: { $each: data.newAttendeeRoles } } 
            }
        );
    }

    const updatedAttendeeRoles = await EventModel.findById(data.eventId).lean().select("attendeeRoles");

    if (!updatedAttendeeRoles)
        throw new AppError("Event not found", 404);

    return res.status(200).json({
        success: true,
        updatedAttendeeRoles
    })

}