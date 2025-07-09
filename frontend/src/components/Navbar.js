import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { LoginContext } from "../context/LoginContext";

const Navbar = () => {
  const { user, logout } = useContext(LoginContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">AQI Insight</div>
      <ul className="navbar-links">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/predict">Predict AQI</NavLink></li>
        <li><NavLink to="/forecast">AQI Forecast</NavLink></li>
        {!user ? (
          <li><NavLink to="/auth">Login / Register</NavLink></li>
        ) : (
          <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
