// frontend/src/pages/Login.js
import React, { useState } from "react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Logged in successfully!");
        // TODO: store user in localStorage or context
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (err) {
      setMessage("❌ Server error.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px", background: "#f7f9fc", borderRadius: "12px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>

      <div style={{ marginBottom: "16px" }}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
      </div>

      <button
        onClick={handleLogin}
        style={{ padding: "12px", backgroundColor: "#1976d2", color: "white", width: "100%", border: "none", borderRadius: "6px" }}
      >
        Login
      </button>

      {message && (
        <div style={{ marginTop: "20px", textAlign: "center", color: message.includes("✅") ? "green" : "red" }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Login;
