import express from "express";
import { authenticate } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as recentSearchController from "../controllers/recentSearch";

const router = express.Router();

router.route("/add").post(authenticate, asyncHandler(recentSearchController.addSearchHistory));
router.route("/").get(authenticate, asyncHandler(recentSearchController.getSearchedUser))
router.route("/clear-search-history").delete(authenticate,asyncHandler(recentSearchController.clearAllSearch));
router.route("/remove-specific-user").put(authenticate, asyncHandler(recentSearchController.removeSearchedUser));

export default router;