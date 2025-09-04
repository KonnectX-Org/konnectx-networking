import { Router } from "express";
import { authenticateEventUser } from "../../../middlewares/authenticateEventUser";
import {
  createRequirement,
  fetchRequirements,
  fetchRequirementById,
} from "../controllers/requirementController";
import { 
  submitBid, 
  sendMessage, 
  fetchChatMessages, 
  markMessagesAsRead 
} from "../controllers/chatControllers";
import {
  fetchInboxAll,
  fetchInboxPostedByMe,
  fetchRequirementChats,
} from "../controllers/inboxController";

const router = Router();

router.use(authenticateEventUser);
router.post("/", createRequirement);
router.get("/", fetchRequirements);
router.get("/:id", fetchRequirementById);
router.post("/submit-bid", submitBid);

router.get("/inbox/posted-by-me", fetchInboxPostedByMe);
router.get("/inbox/all", fetchInboxAll);
router.get("/:requirementId/chats", fetchRequirementChats);

// Chat message routes
router.post("/chats/:chatId/messages", sendMessage);
router.get("/chats/:chatId/messages", fetchChatMessages);
router.patch("/chats/:chatId/mark-read", markMessagesAsRead);

export default router;
