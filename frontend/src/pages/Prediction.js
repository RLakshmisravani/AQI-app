import React, { useState } from "react";
import "./Prediction.css";

const Prediction = () => {
  const [formData, setFormData] = useState({
    Precipitation: "",
    Temp_Max: "",
    Temp_Min: "",
    Wind_Speed: "",
    Humidity_Mean: "",
    Humidity_Max: "",
    Humidity_Min: "",
    Dew_Point: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://localhost:5000/predict-from-weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.predicted_aqi);
      }
    } catch (err) {
      setError("Failed to fetch prediction.");
    }
  };

  return (
    <div className="prediction-wrapper">
      <h2 className="prediction-title">Predict AQI from Weather Parameters</h2>

      <div className="prediction-card">
        {Object.keys(formData).map((key) => (
          <div key={key} className="prediction-input-group">
            <label className="prediction-label">{key.replace(/_/g, " ")}</label>
            <input
              type="number"
              step="any"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className="prediction-input"
              placeholder={`Enter ${key.replace(/_/g, " ")}`}
            />
          </div>
        ))}

        <button onClick={handlePredict} className="prediction-button">
          Predict AQI
        </button>

        {result !== null && (
          <div className="prediction-result prediction-success">
            Predicted AQI: <strong>{result}</strong>
          </div>
        )}

        {error && (
          <div className="prediction-result prediction-error">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;
