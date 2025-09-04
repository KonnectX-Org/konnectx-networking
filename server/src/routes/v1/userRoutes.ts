import { Router } from "express";
import userRoutes from "../../modules/user/routes/userRoutes";
import eventRoutes from "../../modules/event/routes/eventUserRoutes";
import friendRoutes from "../../modules/friendManagement/routes/friendManagementRoutes";
import notificationRoutes from "../../modules/notification/routes/notificationRoutes";
import recentSearchRoutes from "../../modules/recentSearch/routes/recentSearchRoutes";
import requirementRoutes from "../../modules/reqWall/routes/requirementRoutes";
const router = Router();

router.use("/", userRoutes);
router.use("/events", eventRoutes);
router.use("/friend-management", friendRoutes);
router.use("/notification", notificationRoutes);
router.use("/recent-search", recentSearchRoutes);
router.use("/requirements", requirementRoutes);

export default router;
