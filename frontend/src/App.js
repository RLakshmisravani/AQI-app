import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Prediction from "./pages/Prediction";
import ForecastPage from "./pages/ForecastPage";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/Navbar";
import { LoginContext, LoginProvider } from "./context/LoginContext";

const AppRoutes = () => {
  const { user } = useContext(LoginContext);

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/auth" />} />
          <Route path="/predict" element={user ? <Prediction /> : <Navigate to="/auth" />} />
          <Route path="/forecast" element={user ? <ForecastPage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <LoginProvider>
      <Router>
        <AppRoutes />
      </Router>
    </LoginProvider>
  );
}

export default App;
