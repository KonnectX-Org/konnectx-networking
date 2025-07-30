import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as orgEventControllers from "../controllers/eventOrgController";

const router = express.Router();

router.post("/create"         ,  asyncHandler(orgEventControllers.createEvent));
router.get("/"        ,  asyncHandler(orgEventControllers.getAllEvents));
router.get("/fetch"        ,  asyncHandler(orgEventControllers.getEventById));
router.put("/edit"         ,  asyncHandler(orgEventControllers.updateEvent));
router.delete("/delete"         ,  asyncHandler(orgEventControllers.deleteEvent));
router.put("/publish"     ,  asyncHandler(orgEventControllers.handlePublishQR));
router.put("/edit-attendee-roles" ,  asyncHandler(orgEventControllers.updateAttendeeRoles));

export default router;
