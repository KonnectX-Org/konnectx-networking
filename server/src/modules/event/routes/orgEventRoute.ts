import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as orgEventControllers from "../controllers/eventOrgController";

const router = express.Router();

router.get("/createEvent"         ,  asyncHandler(orgEventControllers.createEvent));
router.get("/getAllEvents"        ,  asyncHandler(orgEventControllers.getAllEvents));
router.get("/getEventById"        ,  asyncHandler(orgEventControllers.getEventById));
router.get("/updateEvent"         ,  asyncHandler(orgEventControllers.updateEvent));
router.get("/deleteEvent"         ,  asyncHandler(orgEventControllers.deleteEvent));
router.get("/handlePublishQR"     ,  asyncHandler(orgEventControllers.handlePublishQR));
router.get("/updateAttendeeRoles" ,  asyncHandler(orgEventControllers.updateAttendeeRoles));

export default router;
