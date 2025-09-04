import { Icon } from "@iconify/react";
import { Banknote, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import userApi from "../../apis/userApi";
import { RequirementDetailI } from "../../types/requirementTypes";
import SubmitBidModal from "../../components/requirements/SubmitBidModal";
import { useUser } from "../../hooks/UserContext";

const RequirementDescription = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [requirement, setRequirement] = useState<RequirementDetailI | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmitBid = async (message: string, files: File[]) => {
    try {
      // For now, we'll just send the message without files
      // File upload functionality can be added later
      const response = await userApi.post("/user/requirements/submit-bid", {
        requirementId: id,
        message: message,
      });

      if (response.data.success) {
        const newChatId = response.data.data.chat?._id;
        console.log(response.data)
        alert("Bid submitted successfully!");
        navigate(`/chat/${newChatId}`);
        setIsModalOpen(false);
        // Optionally refresh the requirement data
        // fetchRequirement();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit bid");
      throw error;
    }
  };

  useEffect(() => {
    const fetchRequirement = async () => {
      if (!id) {
        setError("Requirement ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userApi.get(`/user/requirements/${id}`);
        if (response.data.success) {
          setRequirement(response.data.data);
        } else {
          setError("Failed to fetch requirement");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch requirement");
      } finally {
        setLoading(false);
      }
    };

    fetchRequirement();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !requirement) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "Requirement not found"}</div>
      </div>
    );
  }
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-grey01 px-3 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-darkBg space-x-3 flex items-center">
            <Icon
              onClick={() => navigate(-1)}
              icon="proicons:arrow-left"
              width="24"
              height="24"
              className="cursor-pointer"
            />
            <p className="font-medium">{requirement.title}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="bg-[#ffffff] rounded-2xl border-2 flex flex-col items-center p-4">
          <div className="w-24 h-24 border-2 rounded-full overflow-hidden">
            {requirement.postedBy?.profileImage ? (
              <img
                src={requirement.postedBy?.profileImage}
                alt={requirement.postedBy?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">
                  {requirement.postedBy?.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm mt-2">
            Created By {requirement.postedBy?.name} on{" "}
            {new Date(requirement.createdAt).toLocaleDateString()}
          </p>
        </div>

        {(requirement.budget || requirement.locationPreference) && (
          <div className="flex items-center justify-start gap-6 px-4 mt-4">
            {requirement.budget && (
              <div className="flex items-center gap-2">
                <Banknote strokeWidth={1} size={26} className="text-primary" />
                <p className="font-bold">
                  ₹{requirement.budget.toLocaleString()}
                </p>
              </div>
            )}
            {requirement.locationPreference && (
              <div className="flex items-center gap-2">
                <MapPin strokeWidth={1} size={22} className="text-primary" />
                <p className="font-bold">{requirement.locationPreference}</p>
              </div>
            )}
          </div>
        )}

        {/* Description Content */}
        <div className="mt-4">
          <div
            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: requirement.description }}
          />
        </div>

        {/* Responses Section */}
        {requirement.isUserPosted && (
          <div className="mt-6 mb-14">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Responses ({requirement.responses?.length ?? 0})
            </h3>
            <div className="space-y-3">
              {requirement.responses?.length
                ? requirement.responses.map((response) => (
                    <div
                      key={response._id}
                      onClick={() => navigate(`/chat/${response._id}`)}
                      className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-12 h-12 border border-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        {response.bidderId?.profileImage ? (
                          <img
                            src={response.bidderId.profileImage}
                            alt={response.bidderId.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">
                              {response.bidderId?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {response.bidderId?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {response.bidderId?.position}
                        </p>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Button at Bottom */}
      {!requirement.isUserPosted &&
        (!requirement.myResponse ? (
          <div className="flex-shrink-0 px-4 mb-16">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black rounded-xl text-white w-full p-4"
            >
              Bid on this requirement
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 px-4 mb-16">
            <button
              onClick={() => navigate(`/chat/${requirement.myResponse?._id}`)}
              className="bg-black rounded-xl text-white w-full p-4"
            >
              My Response
            </button>
          </div>
        ))}

      {/* Submit Bid Modal */}
      <SubmitBidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitBid}
        userName={user?.name || "User"}
      />
    </div>
  );
};

export default RequirementDescription;
