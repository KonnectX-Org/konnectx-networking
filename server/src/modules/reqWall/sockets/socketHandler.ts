import { Server, Socket } from "socket.io";
import { ReqMessageModel as msgModel } from "../models/msgModel";
import {handleJoinRequirement , handleMessageSeen ,handleDisconnect } from "./eventHadlers"

export const initializeSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Register all events
    handleJoinRequirement(socket);
    handleMessageSeen(socket, io);
    handleDisconnect(socket);

    // Add more event handlers here in the future
  });
};

