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
            {biddersCount > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {biddersCount}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-1">
            {biddersCount} member{biddersCount !== 1 ? 's' : ''}
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
