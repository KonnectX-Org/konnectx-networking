import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { userI, userLevelDataI } from "../types/userTypes";

// Define context type
interface UserContextType {
  user: userI | undefined;
  userLevelData: userLevelDataI | undefined;
  updateUser: (updates: Partial<userI>) => void;
  updateUserLevelData: (updates: Partial<userLevelDataI>) => void;
}

// Create context with no default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component that accepts a user as a prop
export const UserProvider: React.FC<{
  user: userI | undefined;
  userLevelData: userLevelDataI | undefined;
  children: ReactNode;
  setUser?: React.Dispatch<React.SetStateAction<userI | undefined>>;
  setUserLevelData?: React.Dispatch<
    React.SetStateAction<userLevelDataI | undefined>
  >;
}> = ({ user, userLevelData, children, setUser, setUserLevelData }) => {
  // Local state to track user and userLevelData
  const [localUser, setLocalUser] = useState<userI | undefined>(user);
  const [localUserLevelData, setLocalUserLevelData] = useState<
    userLevelDataI | undefined
  >(userLevelData);

  // Update local state when props change
  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    setLocalUserLevelData(userLevelData);
  }, [userLevelData]);

  // Function to update user data
  const updateUser = (updates: Partial<userI>) => {
    if (localUser) {
      const updatedUser = { ...localUser, ...updates };
      setLocalUser(updatedUser);
      // If parent component provided setUser function, update the parent state as well
      if (setUser) {
        setUser(updatedUser);
      }
    }
  };

  // Function to update user level data
  const updateUserLevelData = (updates: Partial<userLevelDataI>) => {
    if (localUserLevelData) {
      const updatedUserLevelData = { ...localUserLevelData, ...updates };
      setLocalUserLevelData(updatedUserLevelData);
      // If parent component provided setUserLevelData function, update the parent state as well
      if (setUserLevelData) {
        setUserLevelData(updatedUserLevelData);
      }
    }
  };

  return (
    <UserContext.Provider
      value={{
        user: localUser,
        userLevelData: localUserLevelData,
        updateUser,
        updateUserLevelData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
