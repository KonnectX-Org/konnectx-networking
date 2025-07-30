import { Router } from "express";
import eventRoutes from "../../modules/event/routes/orgEventRoute"
import organizationRoutes from "../../modules/organization/routes/organizationRoutes"

const router = Router();

router.use("/event", eventRoutes);
router.use("/org", organizationRoutes);

export default router;
