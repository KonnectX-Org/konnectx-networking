import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import { getIndustryTree, searchIndustries } from "../controllers/industryController";

const router = express.Router();

router.get("/tree", asyncHandler(getIndustryTree));
router.get("/search", asyncHandler(searchIndustries));

export default router;