import { Icon } from "@iconify/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../hooks/UserContext";
import { useSocket } from "../../hooks/SocketContext";
import userApi from "../../apis/userApi";
import MessageBubble from "../../components/requirements/MessageBubble";
import MessageInput from "../../components/requirements/MessageInput";

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

interface FetchMessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    pagination: {
      hasNextPage: boolean;
      nextCursor: string | null;
      limit: number;
    };
  };
}

const Chat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user } = useUser();
  const { 
    joinChat, 
    leaveChat, 
    sendMessage: sendSocketMessage, 
    markAsRead: markSocketAsRead,
    onNewMessage,
    offNewMessage,
    isConnected 
  } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fetchMessagesRef = useRef<((cursor?: string | null, isLoadMore?: boolean) => Promise<void>) | null>(null);
  const markAsReadRef = useRef<(() => Promise<void>) | null>(null);

  // Scroll to bottom for new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  // Fetch messages with pagination
  const fetchMessages = useCallback(
    async (cursor?: string | null, isLoadMore = false) => {
      if (!chatId) return;

      try {
        if (!isLoadMore) setLoading(true);
        else setLoadingMore(true);

        const params = new URLSearchParams();
        params.append("limit", "20");
        if (cursor) {
          params.append("cursor", cursor);
        }

        const response = await userApi.get<FetchMessagesResponse>(
          `/user/requirements/chats/${chatId}/messages?${params.toString()}`
        );

        if (response.data.success) {
          const newMessages = response.data.data.messages;

          if (isLoadMore) {
            // For load more, prepend older messages
            setMessages((prev) => [...newMessages, ...prev]);
          } else {
            // For initial load, set all messages
            setMessages(newMessages);
          }

          setHasNextPage(response.data.data.pagination.hasNextPage);
          setNextCursor(response.data.data.pagination.nextCursor);
        } else {
          setError("Failed to fetch messages");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch messages");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [chatId]
  );

  // Load more messages (infinite scroll)
  const loadMoreMessages = () => {
    if (hasNextPage && !loadingMore && nextCursor) {
      fetchMessages(nextCursor, true);
    }
  };

  // Send message - now with real-time support
  const handleSendMessage = async (messageText: string) => {
    if (!chatId || !user) return;

    try {
      setSendingMessage(true);

      // Send via Socket.IO if connected, otherwise fallback to HTTP
      if (isConnected) {
        sendSocketMessage(chatId, messageText);
      } else {
        // Fallback to HTTP API
        const response = await userApi.post(
          `/user/requirements/chats/${chatId}/messages`,
          { message: messageText }
        );

        if (response.data.success) {
          const newMessage = response.data.data;
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Mark messages as read when component mounts and when leaving
  const markAsRead = useCallback(async () => {
    if (!chatId) return;

    try {
      // Use socket if connected, otherwise HTTP
      if (isConnected) {
        markSocketAsRead(chatId);
      } else {
        await userApi.patch(`/user/requirements/chats/${chatId}/mark-read`);
      }
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  }, [chatId, isConnected, markSocketAsRead]);

  // Update refs whenever functions change
  useEffect(() => {
    fetchMessagesRef.current = fetchMessages;
    markAsReadRef.current = markAsRead;
  }, [fetchMessages, markAsRead]);

  // Socket event handlers for real-time updates
  useEffect(() => {
    if (!chatId) return;

    const handleNewMessage = (data: { chatId: string; message: Message }) => {
      if (data.chatId === chatId) {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(msg => msg._id === data.message._id);
          if (messageExists) return prev;
          
          // Backend already sets isOwnMessage correctly, don't override it
          const updatedMessage = data.message;
          
          return [...prev, updatedMessage];
        });
        
        // Scroll to bottom for new messages
        setTimeout(scrollToBottom, 100);
      }
    };

    // Subscribe to new messages
    onNewMessage(handleNewMessage);

    // Cleanup on unmount
    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [chatId, onNewMessage, offNewMessage, user?._id]);

  // Join/leave chat rooms
  useEffect(() => {
    if (chatId && isConnected) {
      joinChat(chatId);
      
      return () => {
        leaveChat(chatId);
      };
    }
  }, [chatId, isConnected, joinChat, leaveChat]);

  // Initial fetch and mark as read
  useEffect(() => {
    if (chatId && fetchMessagesRef.current && markAsReadRef.current) {
      fetchMessagesRef.current();
      markAsReadRef.current();
    }
  }, [chatId]);

  // Scroll to bottom when new messages arrive (not for load more)
  useEffect(() => {
    if (messages.length > 0 && !loadingMore) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, loadingMore]);

  // Handle scroll for infinite scroll
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && hasNextPage && !loadingMore) {
      loadMoreMessages();
    }
  };

  if (!chatId) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Chat ID not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col bg-gray-50"
      // style={{ height: window.innerHeight - 60 }}
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center space-x-3">
        <Icon
          onClick={() => navigate(-1)}
          icon="proicons:arrow-left"
          width="24"
          height="24"
          className="cursor-pointer text-darkBg"
        />
        <div className="flex-1">
          <h2 className="font-medium text-darkBg">Chat</h2>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
      >
        {/* Load More Indicator */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwnMessage={message.isOwnMessage}
          />
        ))}

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Icon
              icon="mingcute:chat-3-line"
              width="48"
              height="48"
              className="mb-4"
            />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sendingMessage}
        placeholder={sendingMessage ? "Sending..." : "Type a message..."}
      />
    </div>
  );
};

export default Chat;
