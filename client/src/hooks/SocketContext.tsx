import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from './UserContext';

interface Message {
  _id: string;
  text: string;
  createdAt: string;
  senderId: string;
  isOwnMessage: boolean;
  sender?: {
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

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, message: string) => void;
  markAsRead: (chatId: string) => void;
  // Event handlers
  onNewMessage: (callback: (data: { chatId: string; message: Message }) => void) => void;
  onUnreadCountUpdate: (callback: (data: UnreadCountUpdate) => void) => void;
  offNewMessage: (callback: (data: { chatId: string; message: Message }) => void) => void;
  offUnreadCountUpdate: (callback: (data: UnreadCountUpdate) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      // No user available, don't connect
      return;
    }

    // Determine server URL based on environment
    // Extract base URL from the API URL configuration
    const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:5000/api/v1';
    const serverUrl = apiBaseUrl.replace('/api/v1', '');

    console.log('Connecting to socket server:', serverUrl);

    // Create socket connection to requirements namespace
    const newSocket = io(`${serverUrl}/requirements`, {
      withCredentials: true, // This will include the httpOnly cookies
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Generic error handler
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Set the socket
    setSocket(newSocket);

    // Cleanup on unmount or user change
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  // Socket methods
  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      console.log('Joining chat:', chatId);
      socket.emit('join-chat', { chatId });
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket && isConnected) {
      console.log('Leaving chat:', chatId);
      socket.emit('leave-chat', { chatId });
    }
  };

  const sendMessage = (chatId: string, message: string) => {
    if (socket && isConnected) {
      console.log('Sending message to chat:', chatId);
      socket.emit('send-message', { chatId, message });
    }
  };

  const markAsRead = (chatId: string) => {
    if (socket && isConnected) {
      console.log('Marking chat as read:', chatId);
      socket.emit('mark-as-read', { chatId });
    }
  };

  // Event handler helpers
  const onNewMessage = (callback: (data: { chatId: string; message: Message }) => void) => {
    if (socket) {
      socket.on('new-message', callback);
    }
  };

  const onUnreadCountUpdate = (callback: (data: UnreadCountUpdate) => void) => {
    if (socket) {
      socket.on('unread-count-updated', callback);
    }
  };

  const offNewMessage = (callback: (data: { chatId: string; message: Message }) => void) => {
    if (socket) {
      socket.off('new-message', callback);
    }
  };

  const offUnreadCountUpdate = (callback: (data: UnreadCountUpdate) => void) => {
    if (socket) {
      socket.off('unread-count-updated', callback);
    }
  };

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    joinChat,
    leaveChat,
    sendMessage,
    markAsRead,
    onNewMessage,
    onUnreadCountUpdate,
    offNewMessage,
    offUnreadCountUpdate,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
