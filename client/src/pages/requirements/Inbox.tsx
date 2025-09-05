import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import userApi from "../../apis/userApi";
import { useSocket } from "../../hooks/SocketContext";
import { useUnreadCount } from "../../hooks/UnreadCountContext";
import PostedByMeCard from "../../components/requirements/PostedByMeCard";
import AllInboxCard from "../../components/requirements/AllInboxCard";
import { Search } from "lucide-react";

interface InboxItem {
  chatId: string;
  requirementId: string;
  title: string;
  biddersCount: number;
  lastActivity: string;
  unreadCount: number;
  bidder?: {
    id: string;
    name: string;
    profileImage?: string;
  };
  postedBy?: {
    id: string;
    name: string;
    profileImage?: string;
  };
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const RequirementsInbox = () => {
  const navigate = useNavigate();
  const { unreadCounts, refreshUnreadCounts } = useUnreadCount();
  const { onUnreadCountUpdate, offUnreadCountUpdate } = useSocket();
  const [inboxType, setInboxType] = useState<"postedByMe" | "all">(
    "postedByMe"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTypeChanging, setIsTypeChanging] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();
  const fetchInboxDataRef = useRef<((page?: number, reset?: boolean) => Promise<void>) | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchInboxData = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (loading) return;

    try {
      setLoading(true);
      const endpoint =
        inboxType === "postedByMe"
          ? `/user/requirements/inbox/posted-by-me?page=${page}&limit=10`
          : `/user/requirements/inbox/all?page=${page}&limit=10`;

      const response = await userApi.get(endpoint);

      if (response.data.success) {
        const newItems = response.data.data.inboxItems;
        const paginationData = response.data.data.pagination;

        setInboxItems((prev) => (reset ? newItems : [...prev, ...newItems]));
        setPagination(paginationData);
        setHasMore(paginationData.hasNextPage);
      }
    } catch (error) {
      console.error("Failed to fetch inbox data:", error);
    } finally {
      setLoading(false);
    }
  }, [inboxType, loading]);

  // Update the ref whenever the function changes
  useEffect(() => {
    fetchInboxDataRef.current = fetchInboxData;
  }, [fetchInboxData]);

  useEffect(() => {
    setIsTypeChanging(true);
    setInboxItems([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setHasMore(true);
    if (fetchInboxDataRef.current) {
      fetchInboxDataRef.current(1, true).finally(() => {
        setIsTypeChanging(false);
      });
    }
  }, [inboxType]);

  // Refresh unread counts only once when component mounts
  useEffect(() => {
    refreshUnreadCounts();
  }, []); // Remove refreshUnreadCounts from dependencies to prevent infinite calls

  useEffect(() => {
    if (pagination.page > 1 && fetchInboxDataRef.current) {
      fetchInboxDataRef.current(pagination.page);
    }
  }, [pagination.page]);

  // Handle real-time unread count updates
  useEffect(() => {
    const handleUnreadCountUpdate = (data: { 
      chatId: string; 
      postedByCount: number; 
      bidderCount: number; 
    }) => {
      setInboxItems(prevItems => 
        prevItems.map(item => {
          if (item.chatId === data.chatId) {
            // Update unread count based on current user's role
            const unreadCount = inboxType === "postedByMe" 
              ? data.postedByCount 
              : data.bidderCount;
            
            return {
              ...item,
              unreadCount
            };
          }
          return item;
        })
      );
    };

    onUnreadCountUpdate(handleUnreadCountUpdate);

    return () => {
      offUnreadCountUpdate(handleUnreadCountUpdate);
    };
  }, [onUnreadCountUpdate, offUnreadCountUpdate, inboxType]);

  const filteredItems = inboxItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <p className="font-medium">Inbox</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for Events/Communities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2   bg-white rounded-full focus:outline-none border"
            />
          </div>

          {/* Dropdown */}
          <div className="relative">
            <select
              value={inboxType}
              onChange={(e) =>
                setInboxType(e.target.value as "postedByMe" | "all")
              }
              className="appearance-none bg-black text-white px-4 py-2 rounded-full pr-8 focus:outline-none cursor-pointer relative"
            >
              <option value="postedByMe">
                Posted by Me {unreadCounts.postedByMeUnread > 0 && `(${unreadCounts.postedByMeUnread})`}
              </option>
              <option value="all">
                All {unreadCounts.allUnread > 0 && `(${unreadCounts.allUnread})`}
              </option>
            </select>
            {/* Show cross-tab notification badge */}
            {((inboxType === "postedByMe" && unreadCounts.allUnread > 0) || 
              (inboxType === "all" && unreadCounts.postedByMeUnread > 0)) && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
            <Icon
              icon="solar:alt-arrow-down-linear"
              width="16"
              height="16"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(loading && inboxItems.length === 0) || isTypeChanging ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No conversations found</div>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isLast = index === filteredItems.length - 1;
            return (
              <div
                key={`${item.chatId}-${item.requirementId}`}
                ref={isLast ? lastItemRef : null}
              >
                {inboxType === "postedByMe" ? (
                  <PostedByMeCard
                    chatId={item.chatId}
                    requirementId={item.requirementId}
                    title={item.title}
                    biddersCount={item.biddersCount}
                    unreadCount={item.unreadCount}
                    bidder={item.bidder!}
                    createdAt={item.createdAt}
                  />
                ) : (
                  <AllInboxCard
                    chatId={item.chatId}
                    requirementId={item.requirementId}
                    title={item.title}
                    biddersCount={item.biddersCount}
                    lastActivity={item.lastActivity}
                    unreadCount={item.unreadCount}
                    postedBy={item.postedBy!}
                    createdAt={item.createdAt}
                  />
                )}
              </div>
            );
          })
        )}

        {loading && inboxItems.length > 0 && !isTypeChanging && (
          <div className="flex items-center justify-center py-4">
            <div className="text-gray-500">Loading more...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementsInbox;
