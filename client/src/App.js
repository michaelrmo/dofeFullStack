import {BrowserRouter, Navigate, Routes, Route} from "react-router-dom";
import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import BotPage from "./scenes/botPage";
import TokenShop from "./scenes/tokenShop";
import AboutMePage from "./scenes/aboutMe";
import ConfirmationPage from "./scenes/confirmationPage";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";


function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));
  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={!isAuth ? <LoginPage />: <Navigate to="/home"/>} />/
            <Route path="/home" element={isAuth ? <HomePage /> : <Navigate to="/"/> } />
            <Route path="/profile/:userId" element={isAuth ? <ProfilePage /> : <Navigate to="/"/> } />
            <Route path="/botPage" element={isAuth ?<BotPage /> : <Navigate to="/"/>} />
            <Route path="/aboutMe" element={isAuth ? <AboutMePage /> : <Navigate to="/"/>} />
            <Route path="/tokenShop" element={isAuth ? <TokenShop /> : <Navigate to="/"/>} />
            <Route path="/confirmationPage" element={isAuth ? <ConfirmationPage /> : <Navigate to="/"/>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
