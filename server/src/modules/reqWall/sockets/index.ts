import { Server } from "socket.io";
import { authenticateSocket, handleChatEvents } from "./chatSocketHandlers";
import logger from "../../../utils/logger";

/**
 * Initialize Socket.IO for requirements chat
 */
export const initializeRequirementSockets = (io: Server) => {
  // Create namespace for requirements
  const requirementsNamespace = io.of('/requirements');
  
  // Apply authentication middleware
  requirementsNamespace.use(authenticateSocket);
  
  // Handle connections
  requirementsNamespace.on('connection', (socket) => {
    handleChatEvents(requirementsNamespace, socket);
  });

  logger.info('Requirements Socket.IO namespace initialized');
  
  return requirementsNamespace;
};
