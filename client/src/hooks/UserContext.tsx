import React, { createContext, useContext, ReactNode } from "react";
import { userI, userLevelDataI } from "../types/userTypes";

// Define context type
interface UserContextType {
  user: userI | undefined;
  userLevelData: userLevelDataI | undefined;
}

// Create context with no default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component that accepts a user as a prop
export const UserProvider: React.FC<{
  user: userI | undefined;
  userLevelData: userLevelDataI | undefined;
  children: ReactNode;
}> = ({ user, userLevelData, children }) => {
  return (
    <UserContext.Provider value={{ user, userLevelData }}>
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
