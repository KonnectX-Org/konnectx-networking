import express from "express";
import { authenticate } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as organizationController from "../controllers/organization";

const router = express.Router();

router.route("/edit").put(authenticate, asyncHandler(organizationController.updateOrganization))
router.route("/").get(authenticate, asyncHandler(organizationController.getOrganizationInfo));

export default router;