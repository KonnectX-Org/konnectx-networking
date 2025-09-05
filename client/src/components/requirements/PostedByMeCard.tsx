import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

interface PostedByMeCardProps {
  chatId: string;
  requirementId: string;
  title: string;
  biddersCount: number;
  unreadCount: number;
  bidder: {
    id: string;
    name: string;
    profileImage?: string;
  };
  createdAt: string;
}

const PostedByMeCard = ({
  requirementId,
  title,
  biddersCount,
  unreadCount,
}: PostedByMeCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/requirements/allchats/${requirementId}`);
  };
  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-darkBg">
              {title}
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2">
                {unreadCount}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-1">
            {biddersCount} member{biddersCount !== 1 ? 's' : ''} • {unreadCount} unread
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
  );
};

export default PostedByMeCard;
