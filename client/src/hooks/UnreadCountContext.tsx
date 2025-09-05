import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useUser } from './UserContext';
import userApi from '../apis/userApi';

interface UnreadCounts {
  postedByMeUnread: number;
  allUnread: number;
  totalUnread: number;
}

interface UnreadCountContextType {
  unreadCounts: UnreadCounts;
  refreshUnreadCounts: () => Promise<void>;
}

const UnreadCountContext = createContext<UnreadCountContextType | null>(null);

export const useUnreadCount = () => {
  const context = useContext(UnreadCountContext);
  if (!context) {
    throw new Error('useUnreadCount must be used within an UnreadCountProvider');
  }
  return context;
};

interface UnreadCountProviderProps {
  children: ReactNode;
}

export const UnreadCountProvider = ({ children }: UnreadCountProviderProps) => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    postedByMeUnread: 0,
    allUnread: 0,
    totalUnread: 0,
  });

  const { user } = useUser();
  const { onUnreadCountUpdate, offUnreadCountUpdate } = useSocket();

  // Use ref to avoid stale closure issues
  const refreshUnreadCountsRef = useRef<(() => Promise<void>) | null>(null);

  const refreshUnreadCounts = useCallback(async () => {
    if (!user) return;

    try {
      const response = await userApi.get('/user/requirements/inbox/unread-counts');
      if (response.data.success) {
        setUnreadCounts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch unread counts:', error);
    }
  }, [user]);

  // Update ref when function changes
  useEffect(() => {
    refreshUnreadCountsRef.current = refreshUnreadCounts;
  }, [refreshUnreadCounts]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      refreshUnreadCounts();
    }
  }, [user]); // Remove refreshUnreadCounts from dependencies

  // Listen for real-time unread count updates - use a debounced approach
  useEffect(() => {
    let timeoutId: number;
    
    const handleUnreadCountUpdate = (_data: any) => {
      // Debounce the refresh to avoid too many API calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (refreshUnreadCountsRef.current) {
          refreshUnreadCountsRef.current();
        }
      }, 500); // Wait 500ms before refreshing
    };

    onUnreadCountUpdate(handleUnreadCountUpdate);

    return () => {
      clearTimeout(timeoutId);
      offUnreadCountUpdate(handleUnreadCountUpdate);
    };
  }, [onUnreadCountUpdate, offUnreadCountUpdate]);

  const contextValue: UnreadCountContextType = {
    unreadCounts,
    refreshUnreadCounts,
  };

  return (
    <UnreadCountContext.Provider value={contextValue}>
      {children}
    </UnreadCountContext.Provider>
  );
};
