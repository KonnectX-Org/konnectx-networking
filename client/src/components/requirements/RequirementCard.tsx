import { ArrowRight } from "lucide-react";
import { RequirementI } from "../../types/requirementTypes";

interface RequirementCardProps {
  requirement: RequirementI;
  onClick?: () => void;
}

const RequirementCard = ({ requirement, onClick }: RequirementCardProps) => {
  const renderOverlappingImages = () => {
    const images = requirement.bidderProfileImages || [];
    const displayImages = images.slice(0, 3);

    if (displayImages.length === 0) {
      return (
        <div className="flex items-center gap-2">
          {/* <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">0</span>
          </div> */}
          <span className="text-[#7D7D7D] text-xs">
            {requirement.membersCount} members
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {displayImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Bidder ${index + 1}`}
              className="w-6 h-6 rounded-full object-cover border-2 border-white"
              style={{ zIndex: displayImages.length - index }}
            />
          ))}
        </div>
        <span className="text-[#7D7D7D] text-xs">
          {requirement.membersCount} {requirement.membersCount === 1 ? "member" : "members"}
        </span>
      </div>
    );
  };

  return (
    <div
      className="rounded-xl p-4 bg-white border-2 border-gray-100 cursor-pointer hover:border-gray-300 transition-colors"
      onClick={onClick}
    >
      <div>
        <h3 className="text-md font-bold cursor-pointer">
          {requirement.title}
        </h3>
        <p className="text-[#7D7D7D] text-sm mt-1">
          Posted by {requirement.postedBy.name}
        </p>
        <div className="flex items-center justify-between mt-3">
          {renderOverlappingImages()}

          <button className="text-black">
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementCard;
