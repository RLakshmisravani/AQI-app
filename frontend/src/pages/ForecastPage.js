import React, { useState, useEffect } from "react";
import "./ForecastPage.css"; // 💡 You’ll create this CSS file next

// 🟩 AQI Category
function getAQICategory(aqi) {
  if (aqi <= 50) return { label: "Good", color: "#b2fab4" };
  if (aqi <= 100) return { label: "Satisfactory", color: "#fff9c4" };
  if (aqi <= 200) return { label: "Moderate", color: "#ffe082" };
  if (aqi <= 300) return { label: "Poor", color: "#ffab91" };
  if (aqi <= 400) return { label: "Very Poor", color: "#ce93d8" };
  return { label: "Severe", color: "#ef5350" };
}

const ForecastPage = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [date, setDate] = useState("");
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://aqi-app-x8fq.onrender.com/cities")
      .then((res) => res.json())
      .then(setCities)
      .catch(() => setError("Failed to load city list"));
  }, []);

  const handleForecast = () => {
    setForecast(null);
    setError("");
    if (!selectedCity || !date) {
      setError("Please select both city and date.");
      return;
    }
    fetch(`https://aqi-app-x8fq.onrender.com/forecast?city=${selectedCity}&date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setForecast(data);
      })
      .catch(() => setError("Failed to fetch forecast."));
  };

  const getFutureDate = (base, offset) => {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="forecast-container">
      <div className="forecast-box">
        <h2 className="forecast-title">AQI Forecast</h2>

        {/* 🔹 Form */}
        <div className="form-group">
          <label>Select City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">-- Choose a city --</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Base Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button className="btn-submit" onClick={handleForecast}>
          Get Forecast
        </button>
      </div>

      {/* 🔹 Forecast Cards */}
      {forecast && (
        <div className="forecast-results">
          <h3>
            Forecast for <span>{forecast.city}</span> starting {forecast.base_date}
          </h3>
          <div className="forecast-cards">
            {[1, 2, 3].map((offset) => {
              const date = getFutureDate(forecast.base_date, offset);
              const aqi = forecast[`forecast_${offset * 24}h`];
              const { label, color } = getAQICategory(aqi);
              return (
                <div
                  key={offset}
                  className="forecast-card"
                  style={{ backgroundColor: color }}
                >
                  <h4>{date}</h4>
                  <p className="aqi-value">AQI: {aqi.toFixed(2)}</p>
                  <p className="aqi-label">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <div className="error-msg">❌ {error}</div>}
    </div>
  );
};

export default ForecastPage;
