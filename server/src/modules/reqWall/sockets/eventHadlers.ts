import { Server, Socket } from "socket.io";
import { ReqMessageModel as msgModel } from "../models/msgModel";

// Join a requirement thread
export const handleJoinRequirement = (socket: Socket) => {
    socket.on("joinRequirement", (reqId: string) => {
      socket.join(reqId);
      console.log(`Client ${socket.id} joined requirement ${reqId}`);
    });
  };
  
  // Mark message as seen
  export const handleMessageSeen = (socket: Socket, io: Server) => {
    socket.on("messageSeen", async ({ messageId, reqId }: { messageId: string; reqId: string }) => {
      try {
        await msgModel.findByIdAndUpdate(messageId, { isSeen: true });
        io.to(reqId).emit("messageSeen", messageId);
      } catch (error) {
        console.error("Error marking message as seen:", error);
      }
    });
  };
  
  // Handle client disconnect
  export const handleDisconnect = (socket: Socket) => {
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  };
  
  
  // Broadcast new message
  export const handleNewMessage = (io: Server, reqId: string, message: any) => {
    io.to(reqId).emit("newMessage", message);
  };
  
  
  
  // All Events
  // 1. joinRequirement
  // 2. messageSeen
  // 3. disconnect
  // 4. newMessage