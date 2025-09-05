import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userApi from "../../apis/userApi";
import { useSocket } from "../../hooks/SocketContext";

interface ChatData {
  chatId: string;
  bidderId: string;
  bidder: {
    id: string;
    name: string;
    profileImage: string;
  };
  lastActivity: string;
  unreadCount: number;
  createdAt: string;
}

interface RequirementChatsResponse {
  success: boolean;
  data: {
    requirementId: string;
    requirementTitle: string;
    totalChats: number;
    chats: ChatData[];
  };
}

const RequirementChats = () => {
  const navigate = useNavigate();
  const { requirementId } = useParams();
  const { onUnreadCountUpdate, offUnreadCountUpdate } = useSocket();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [requirementTitle, setRequirementTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!requirementId) {
      setError("Requirement ID not found");
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await userApi.get<RequirementChatsResponse>(
          `/user/requirements/${requirementId}/chats`
        );
        
        if (response.data.success) {
          setChats(response.data.data.chats);
          setRequirementTitle(response.data.data.requirementTitle);
        } else {
          setError("Failed to fetch chats");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [requirementId]);

  // Handle real-time unread count updates
  useEffect(() => {
    const handleUnreadCountUpdate = (data: { 
      chatId: string; 
      postedByCount: number; 
      bidderCount: number; 
    }) => {
      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.chatId === data.chatId) {
            // For requirement chats, we show the poster's unread count
            // (since this is showing chats for a requirement posted by current user)
            return {
              ...chat,
              unreadCount: data.postedByCount
            };
          }
          return chat;
        })
      );
    };

    onUnreadCountUpdate(handleUnreadCountUpdate);

    return () => {
      offUnreadCountUpdate(handleUnreadCountUpdate);
    };
  }, [onUnreadCountUpdate, offUnreadCountUpdate]);

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

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
    <div>
      <div className="bg-grey01 px-3 py-5">
        <div className="text-darkBg space-x-3 flex items-center">
          <Icon
            onClick={() => navigate(-1)}
            icon="proicons:arrow-left"
            width="24"
            height="24"
            className="cursor-pointer"
          />
          <p className="font-medium">{requirementTitle}</p>
        </div>
      </div>
      
      <div className="px-3 py-4">
        {chats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No chats found for this requirement</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              {chats.length} chat{chats.length !== 1 ? 's' : ''} 
            </p>
            
            {chats.map((chat) => (
              <div
                key={chat.chatId}
                onClick={() => handleChatClick(chat.chatId)}
                className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={chat.bidder.profileImage || "/default-avatar.png"}
                      alt={chat.bidder.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-darkBg">
                        {chat.bidder.name}
                      </h3>
                      {chat.unreadCount > 0 && (
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1">
                      Last activity: {new Date(chat.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Icon
                    icon="proicons:arrow-right"
                    width="20"
                    height="20"
                    className="text-gray-400"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementChats;
