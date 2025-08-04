import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import FormPage from "./pages/FormPage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import ConnectPage from "./pages/ConnectPage";
import Profile from "./pages/Profile";
import NotificatonsPage from "./pages/NotificationsPage";
import LayoutWithHeader from "./layouts/LayoutWithHeader";
import LayoutWithOutHeader from "./layouts/LayoutWithOutHeader";
import RequestsPage from "./pages/RequestsPage";
import MyNetworkPage from "./pages/MyNetworkPage";
import LevelUpPage from "./pages/LevelUpPage";
import QRPage from "./pages/QRPage";
import userApi from "./apis/userApi";
import { useEffect, useState } from "react";
import { UserProvider } from "./hooks/UserContext";
import { userI, userLevelDataI } from "./types/userTypes";
import QRConnecting from "./pages/QRConnecting";
import ConnectionProfile from "./pages/ConnectionProfile";

const App = () => {
  const [user, setUser] = useState<userI | undefined>(undefined);
  const [userLevelData, setUserLevelData] = useState<
    userLevelDataI | undefined
  >(undefined);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const response = await userApi.get("/user/");

      if (response.status == 200) {
        setUser(response.data.user);
        setUserLevelData(response.data.userLevelData);

        if (!response.data.userLevelData.badgeSplashRead) navigate("/levelup");
      }
    } catch (e) {
      // Don't redirect if we're on the login page
      if (!location.pathname.startsWith('/login')) {
        navigate("/form/6864dd952cf135f217b9e057");
      }
    }
  };

  useEffect(() => {
    if (!user) fetchUser();
  }, [location.pathname]);

  return (
    <>
      <UserProvider 
        user={user} 
        userLevelData={userLevelData} 
        setUser={setUser}
        setUserLevelData={setUserLevelData}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login/:eventId" element={<LoginPage />} />
          <Route path="/form/:eventId" element={<FormPage />} />
          
          {/* Authenticated routes with header */}
          <Route element={<LayoutWithHeader />}>
            <Route path="/home" element={<MainPage />} />
            <Route path="/connect/:eventId" element={<ConnectPage />} />
          </Route>

          {/* Authenticated routes without header */}
          <Route element={<LayoutWithOutHeader />}>
            <Route path="/notifications" element={<NotificatonsPage />} />
            <Route path="/requests/:rtype" element={<RequestsPage />} />
            <Route path="/network" element={<MyNetworkPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<ConnectionProfile />} />
          </Route>

          {/* Other routes */}
          <Route path="/qr" element={<QRPage />} />
          <Route path="/qr-connect/:friendId" element={<QRConnecting />} />
          <Route path="/levelup" element={<LevelUpPage />} />
          
          {/* Default redirect */}
          <Route path="/" element={<FormPage />} />
        </Routes>
      </UserProvider>
    </>
  );
};

export default App;