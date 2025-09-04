import { useNavigate } from "react-router-dom";

interface AllInboxCardProps {
  chatId: string;
  requirementId: string;
  title: string;
  biddersCount: number;
  lastActivity: string;
  unreadCount: number;
  postedBy: {
    id: string;
    name: string;
    profileImage?: string;
  };
  createdAt: string;
}

const AllInboxCard = ({
  chatId,
  title,
  lastActivity,
  unreadCount,
  postedBy,
}: AllInboxCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
          {postedBy?.profileImage ? (
            <img
              src={postedBy?.profileImage}
              alt={postedBy?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                {postedBy?.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2">
                {unreadCount}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-1">Posted by {postedBy?.name}</p>
          
          {/* <div className="flex items-center text-xs text-gray-500">
            <span>{formatTime(lastActivity)}</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AllInboxCard;
