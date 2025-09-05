import { Icon } from "@iconify/react";
import { CirclePlus, Mail, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import RequirementCard from "../../components/requirements/RequirementCard";
import userApi from "../../apis/userApi";
import { useUnreadCount } from "../../hooks/UnreadCountContext";
import {
  RequirementI,
  RequirementsResponseI,
  RequirementsPaginationI,
} from "../../types/requirementTypes";

const Requirements = () => {
  const navigate = useNavigate();
  const { unreadCounts } = useUnreadCount();
  const [activeTab, setActiveTab] = useState<"all" | "postedByMe">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [requirements, setRequirements] = useState<RequirementI[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<RequirementsPaginationI | null>(
    null
  );
  const [hasMoreData, setHasMoreData] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const fetchRequirements = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          type: activeTab === "all" ? "all" : "postedByMe",
          page: page.toString(),
          limit: "10",
        });

        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        const response = await userApi.get<RequirementsResponseI>(
          `/user/requirements?${params.toString()}`
        );

        if (response.data.success) {
          const newRequirements = response.data.data;
          setPagination(response.data.pagination);

          if (reset) {
            setRequirements(newRequirements);
          } else {
            setRequirements((prev) => [...prev, ...newRequirements]);
          }

          setHasMoreData(response.data.pagination.hasNextPage);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, searchQuery, loading]
  );

  const loadMoreData = useCallback(() => {
    if (pagination && hasMoreData && !loading) {
      fetchRequirements(pagination.currentPage + 1, false);
    }
  }, [pagination, hasMoreData, loading, fetchRequirements]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreData && !loading) {
          loadMoreData();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMoreData, hasMoreData, loading]);

  // Fetch data when tab changes
  useEffect(() => {
    setRequirements([]);
    setPagination(null);
    setHasMoreData(true);
    fetchRequirements(1, true);
  }, [activeTab]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRequirements([]);
      setPagination(null);
      setHasMoreData(true);
      fetchRequirements(1, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleRequirementClick = (requirement: RequirementI) => {
    navigate(`/requirements/${requirement._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-grey01 px-3 py-5">
        <div className="flex items-center justify-between">
          <div className="text-darkBg space-x-3 flex items-center">
            <Icon
              onClick={() => navigate(-1)}
              icon="proicons:arrow-left"
              width="24"
              height="24"
              className="cursor-pointer"
            />
            <p className="font-medium">Requirements</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/requirements/create")}
              className="bg-black text-white flex items-center px-4 py-2 rounded-full text-sm gap-2"
            >
              Create New
              <CirclePlus size={16} />
            </button>
            <button
              className="bg-black text-white flex items-center p-2 rounded-full text-sm gap-2 relative"
              onClick={() => navigate("/requirements/inbox")}
            >
              <Mail strokeWidth={1} size={22} />
              {unreadCounts.totalUnread > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                  {unreadCounts.totalUnread > 99
                    ? "99+"
                    : unreadCounts.totalUnread}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
            size={20}
          />
          <input
            type="text"
            placeholder="Search requirements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-full focus:outline-none border"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6 bg-white py-2 mx-4 rounded-full border">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2 flex-1 min-w-max py-3 rounded-full text-sm font-medium transition-colors relative ${
              activeTab === "all"
                ? "bg-black text-white"
                : "bg-white text-gray-600"
            }`}
          >
            All Requirements
          </button>
          <button
            onClick={() => setActiveTab("postedByMe")}
            className={`px-2 flex-1 py-3 min-w-max rounded-full text-sm font-medium transition-colors relative ${
              activeTab === "postedByMe"
                ? "bg-black text-white"
                : "bg-white text-gray-600"
            }`}
          >
            Posted by Me
          </button>
        </div>
      </div>

      {/* Requirements Grid */}
      <div className="px-4 pb-6">
        {requirements.length === 0 && !loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery
                ? "No requirements found matching your search."
                : activeTab === "all"
                ? "No requirements available."
                : "You haven't posted any requirements yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {requirements.map((requirement) => (
              <RequirementCard
                key={requirement._id}
                requirement={requirement}
                onClick={() => handleRequirementClick(requirement)}
              />
            ))}
          </div>
        )}

        {/* Loading indicator for infinite scroll */}
        {hasMoreData && (
          <div
            ref={loadingRef}
            className="flex justify-center items-center py-4"
          >
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                <span className="text-gray-500">Loading more...</span>
              </div>
            )}
          </div>
        )}

        {/* No more data indicator */}
        {!hasMoreData && requirements.length > 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">
              No more requirements to load
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requirements;
