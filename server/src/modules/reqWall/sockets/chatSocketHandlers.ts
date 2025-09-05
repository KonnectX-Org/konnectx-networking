import { Server, Socket, Namespace } from "socket.io";
import { verifyAccessToken } from "../../../utils/jwtUtils";
import { ChatModel } from "../models/chatModel";
import { MessageModel } from "../models/messageModel";
import { EventUserModel } from "../../event/models/eventUsersModel";
import AppError from "../../../utils/appError";
import logger from "../../../utils/logger";
import mongoose from "mongoose";

interface AuthenticatedSocket extends Socket {
  eventUserId?: string;
  eventId?: string;
  userId?: string;
}

interface ChatJoinData {
  chatId: string;
}

interface SendMessageData {
  chatId: string;
  message: string;
}

interface MessageResponse {
  _id: string;
  text: string;
  attachments: any[];
  createdAt: Date;
  senderId: string;
  isOwnMessage: boolean;
  sender: {
    id: string;
    name: string;
    profileImage?: string;
  };
}

interface UnreadCountUpdate {
  chatId: string;
  postedByCount: number;
  bidderCount: number;
}

/**
 * Socket authentication middleware
 */
export const authenticateSocket = async (socket: AuthenticatedSocket, next: any) => {
  try {
    // Get token from cookies or auth header
    const token = socket.request.headers.cookie
      ? socket.request.headers.cookie
          .split(';')
          .find((c: string) => c.trim().startsWith('accessToken='))
          ?.split('=')[1]
      : socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const payload = verifyAccessToken(token);
    if (!payload || !payload.eventUserId || !payload.eventId) {
      return next(new Error('Invalid or expired token'));
    }

    // Verify the EventUser still exists
    const eventUser = await EventUserModel.findById(payload.eventUserId);
    if (!eventUser) {
      return next(new Error('Event user not found'));
    }

    // Verify the eventUser belongs to the correct event
    if (eventUser.eventId.toString() !== payload.eventId) {
      return next(new Error('Event context mismatch'));
    }

    socket.eventUserId = payload.eventUserId;
    socket.eventId = payload.eventId;
    socket.userId = payload.id;

    logger.info(`Socket authenticated for eventUser: ${payload.eventUserId}, event: ${payload.eventId}`);
    next();
  } catch (error) {
    logger.error('Socket authentication failed:', error);
    next(new Error('Authentication failed'));
  }
};

/**
 * Handle socket connection and chat events
 */
export const handleChatEvents = (io: Server | Namespace, socket: AuthenticatedSocket) => {
  logger.info(`Socket connected: ${socket.id} for eventUser: ${socket.eventUserId}`);

  // Join user to their personal room for receiving notifications
  if (socket.eventUserId) {
    socket.join(`user:${socket.eventUserId}`);
    logger.info(`User ${socket.eventUserId} joined personal room`);
  }

  /**
   * Join a specific chat room
   */
  socket.on('join-chat', async (data: ChatJoinData) => {
    try {
      const { chatId } = data;

      if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        socket.emit('error', { message: 'Invalid chat ID' });
        return;
      }

      // Verify user has access to this chat
      const chat = await ChatModel.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      const isAuthorized = 
        chat.postedBy.toString() === socket.eventUserId || 
        chat.bidderId.toString() === socket.eventUserId;

      if (!isAuthorized) {
        socket.emit('error', { message: 'Unauthorized access to chat' });
        return;
      }

      // Join the chat room
      socket.join(`chat:${chatId}`);
      logger.info(`User ${socket.eventUserId} joined chat: ${chatId}`);

      // Emit success
      socket.emit('chat-joined', { chatId });

    } catch (error) {
      logger.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  /**
   * Leave a specific chat room
   */
  socket.on('leave-chat', (data: ChatJoinData) => {
    const { chatId } = data;
    socket.leave(`chat:${chatId}`);
    logger.info(`User ${socket.eventUserId} left chat: ${chatId}`);
    socket.emit('chat-left', { chatId });
  });

  /**
   * Send a real-time message
   */
  socket.on('send-message', async (data: SendMessageData) => {
    try {
      const { chatId, message } = data;

      if (!chatId || !message?.trim()) {
        socket.emit('error', { message: 'Chat ID and message are required' });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        socket.emit('error', { message: 'Invalid chat ID format' });
        return;
      }

      // Find the chat and verify user is authorized
      const chat = await ChatModel.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      const isAuthorized = 
        chat.postedBy.toString() === socket.eventUserId || 
        chat.bidderId.toString() === socket.eventUserId;

      if (!isAuthorized) {
        socket.emit('error', { message: 'Unauthorized to send message in this chat' });
        return;
      }

      const currentTime = new Date();

      // Use session for transaction
      const session = await mongoose.startSession();
      
      let createdMessage: any;
      
      try {
        await session.withTransaction(async () => {
          // Create the message
          const newMessage = await MessageModel.create([{
            chatId,
            senderId: socket.eventUserId,
            text: message.trim(),
            attachments: [],
          }], { session });

          // Determine who gets the unread count increment
          const isPostedBySender = chat.postedBy.toString() === socket.eventUserId;
          const updateQuery = isPostedBySender 
            ? { $inc: { "unreadCount.bidder": 1 } }
            : { $inc: { "unreadCount.postedBy": 1 } };

          // Update chat lastActivity and unread count
          await ChatModel.findByIdAndUpdate(
            chatId,
            {
              lastActivity: currentTime,
              ...updateQuery,
            },
            { session }
          );

          createdMessage = newMessage[0];
        });

        // Populate the message after transaction
        const populatedMessage = await MessageModel.findById(createdMessage._id)
          .populate("senderId", "name profileImage")
          .lean();

        // Format the response for real-time broadcast
        const messageData = populatedMessage as any;
        const senderData = messageData?.senderId as any;
        
        const baseMessage = {
          _id: messageData?._id,
          text: messageData?.text,
          attachments: messageData?.attachments || [],
          createdAt: messageData?.createdAt,
          senderId: senderData?._id || messageData?.senderId,
          sender: {
            id: senderData?._id || messageData?.senderId,
            name: senderData?.name || "Unknown User",
            profileImage: senderData?.profileImage || null,
          },
        };

        // Send personalized messages to each user with correct isOwnMessage
        const senderId = senderData?._id || messageData?.senderId;
        
        // Send to poster (if not the sender)
        if (chat.postedBy.toString() !== senderId.toString()) {
          io.to(`user:${chat.postedBy}`).emit('new-message', {
            chatId,
            message: { ...baseMessage, isOwnMessage: false }
          });
        }
        
        // Send to bidder (if not the sender)
        if (chat.bidderId.toString() !== senderId.toString()) {
          io.to(`user:${chat.bidderId}`).emit('new-message', {
            chatId,
            message: { ...baseMessage, isOwnMessage: false }
          });
        }
        
        // Send to sender with isOwnMessage: true
        io.to(`user:${senderId}`).emit('new-message', {
          chatId,
          message: { ...baseMessage, isOwnMessage: true }
        });

        // Get updated chat data for unread counts
        const updatedChat = await ChatModel.findById(chatId).lean();
        if (updatedChat) {
          const unreadUpdate: UnreadCountUpdate = {
            chatId,
            postedByCount: updatedChat.unreadCount.postedBy,
            bidderCount: updatedChat.unreadCount.bidder
          };

          // Notify both users about unread count changes
          io.to(`user:${updatedChat.postedBy}`).emit('unread-count-updated', unreadUpdate);
          io.to(`user:${updatedChat.bidderId}`).emit('unread-count-updated', unreadUpdate);
        }

        // Confirm message sent to sender
        socket.emit('message-sent', { chatId, messageId: baseMessage._id });

      } finally {
        await session.endSession();
      }

    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * Mark messages as read in real-time
   */
  socket.on('mark-as-read', async (data: ChatJoinData) => {
    try {
      const { chatId } = data;

      if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        socket.emit('error', { message: 'Invalid chat ID' });
        return;
      }

      // Find the chat and verify user is authorized
      const chat = await ChatModel.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      const isAuthorized = 
        chat.postedBy.toString() === socket.eventUserId || 
        chat.bidderId.toString() === socket.eventUserId;

      if (!isAuthorized) {
        socket.emit('error', { message: 'Unauthorized to access this chat' });
        return;
      }

      // Determine which unread count to reset
      const isPostedByUser = chat.postedBy.toString() === socket.eventUserId;
      const updateQuery = isPostedByUser 
        ? { "unreadCount.postedBy": 0 }
        : { "unreadCount.bidder": 0 };

      // Update the unread count
      const updatedChat = await ChatModel.findByIdAndUpdate(
        chatId, 
        updateQuery, 
        { new: true }
      ).lean();

      if (updatedChat) {
        const unreadUpdate: UnreadCountUpdate = {
          chatId,
          postedByCount: updatedChat.unreadCount.postedBy,
          bidderCount: updatedChat.unreadCount.bidder
        };

        // Notify both users about unread count changes
        io.to(`user:${updatedChat.postedBy}`).emit('unread-count-updated', unreadUpdate);
        io.to(`user:${updatedChat.bidderId}`).emit('unread-count-updated', unreadUpdate);
      }

      socket.emit('marked-as-read', { chatId });

    } catch (error) {
      logger.error('Error marking as read:', error);
      socket.emit('error', { message: 'Failed to mark as read' });
    }
  });

  /**
   * Handle socket disconnection
   */
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id} for eventUser: ${socket.eventUserId}`);
  });
};
