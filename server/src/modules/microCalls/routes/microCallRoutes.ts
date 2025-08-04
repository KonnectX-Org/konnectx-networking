import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import { createEvent } from "../controllers/eventAppCalls" ;

const router = express.Router();

router.post("/createEvent", asyncHandler(createEvent));

export default router;