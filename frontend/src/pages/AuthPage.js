import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";
import { LoginContext } from "../context/LoginContext";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    state: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(LoginContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setMessage("");

    const url = isLogin
      ? "https://aqi-app-x8fq.onrender.com/auth/login"
      : "https://aqi-app-x8fq.onrender.com/auth/register";

    const payload = isLogin
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Success!");

        if (isLogin && data.user) {
          login(data.user); // ✅ update context
          navigate("/");     // ✅ redirect to Home
        }

        if (!isLogin) {
          setIsLogin(true);
          setMessage("Registered successfully! Please login.");
        }
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-tabs">
          <span className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>Login</span>
          <span className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>Register</span>
        </div>

        <div className="auth-form">
          {!isLogin && (
            <>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" />
              <input name="state" value={form.state} onChange={handleChange} placeholder="State" />
            </>
          )}

          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" />
          <button onClick={handleSubmit}>{isLogin ? "Login" : "Register"}</button>

          {message && <div className="auth-message">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
