import { Router } from "express";
import eventRoutes from "../../modules/event/routes/eventUserRoutes";
import friendRoutes from "../../modules/friendManagement/routes/friendManagementRoutes";
import notificationRoutes from "../../modules/notification/routes/notificationRoutes";
import recentSearchRoutes from "../../modules/recentSearch/routes/recentSearchRoutes";
import userRoutes from "../../modules/user/routes/userRoutes";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

router.use("/", userRoutes);
router.use("/events", eventRoutes);
router.use("/friend-management", friendRoutes);
router.use("/notification", notificationRoutes);
router.use("/recent-search", recentSearchRoutes);

export default router;
