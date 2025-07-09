// frontend/src/pages/Register.js
import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    state: "",
    password: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setSuccess("");
    setError("");

    try {
      const res = await fetch("https://aqi-app-x8fq.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("✅ Registered successfully!");
        setFormData({
          name: "",
          email: "",
          city: "",
          state: "",
          password: "",
        });
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Server error.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px", background: "#f7f9fc", borderRadius: "12px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Register</h2>

      {["name", "email", "city", "state", "password"].map((field) => (
        <div key={field} style={{ marginBottom: "16px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
          </label>
          <input
            type={field === "password" ? "password" : "text"}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>
      ))}

      <button
        onClick={handleRegister}
        style={{ padding: "12px", backgroundColor: "#1976d2", color: "white", width: "100%", border: "none", borderRadius: "6px" }}
      >
        Register
      </button>

      {success && (
        <div style={{ marginTop: "20px", color: "green", textAlign: "center", fontWeight: "bold" }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red", textAlign: "center", fontWeight: "bold" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Register;
