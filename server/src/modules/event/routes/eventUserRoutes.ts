import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as eventUserControllers from "../controllers/eventUserController";

const router = express.Router();

router.get("/get-all-event-Guest"   ,  asyncHandler(eventUserControllers.getGuestOfAnEvent));
router.get("/get-events"  ,  asyncHandler(eventUserControllers.getAllEventsOfUser));
router.get("/get-attendees-list"    ,  asyncHandler(eventUserControllers.getAttendiesRole));
router.get("/search-guests" ,  asyncHandler(eventUserControllers.searchGuestInEvents));

export default router;



