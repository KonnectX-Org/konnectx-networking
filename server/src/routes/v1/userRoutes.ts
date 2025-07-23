import { Router } from "express";
import userRouter from "./userRoutes";
import eventRoutes from "../../modules/event/routes/eventUserRoutes";
import friendRoutes from "../../modules/friendManagement/routes/friendManagementRoutes";
import notificationRoutes from "../../modules/notification/routes/notificationRoutes";
import recentSearchRoutes from "../../modules/recentSearch/routes/recentSearchRoutes";

const router = Router();

router.use("/", userRouter);
router.use("/events",eventRoutes);
router.use("/friend-management", friendRoutes);
router.use("/notification", notificationRoutes);
router.use("/recent-search", recentSearchRoutes);

export default router;