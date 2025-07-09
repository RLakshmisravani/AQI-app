import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 🔹 Category label + color
const getAQICategory = (aqi) => {
  if (aqi <= 50) return { label: "Good", color: "#a8e6a3" };
  if (aqi <= 100) return { label: "Satisfactory", color: "#fff59d" };
  if (aqi <= 200) return { label: "Moderate", color: "#ffe082" };
  if (aqi <= 300) return { label: "Poor", color: "#ff8a65" };
  if (aqi <= 400) return { label: "Very Poor", color: "#ba68c8" };
  return { label: "Severe", color: "#d32f2f" };
};

const AQIGraph = ({ selectedCity, setSelectedCity }) => {
  const [cityOptions, setCityOptions] = useState([]);
  const [aqiData, setAqiData] = useState([]);
  const [latestAQI, setLatestAQI] = useState(null);
  const [hoveredAQI, setHoveredAQI] = useState(null);

  // 🔸 Load cities once
  useEffect(() => {
    fetch("https://aqi-app-x8fq.onrender.com/cities")
      .then((res) => res.json())
      .then((data) => {
        setCityOptions(data);
        if (!selectedCity && data.length > 0) {
          setSelectedCity(data[0]);
        }
      });
  }, [selectedCity, setSelectedCity]);

  // 🔸 Fetch data when city changes
  useEffect(() => {
    if (!selectedCity) return;

    fetch(`https://aqi-app-x8fq.onrender.com/history?city=${selectedCity}`)
      .then((res) => res.json())
      .then((data) => {
        setAqiData(data);
        if (data.length > 0) {
          setLatestAQI(data[data.length - 1].aqi);
        }
      });
  }, [selectedCity]);

  const effectiveAQI = hoveredAQI ?? latestAQI;
  const recommendation = effectiveAQI ? getAQICategory(effectiveAQI) : null;

  return (
    <div style={{ marginTop: "40px" }}>
      <h3 style={{ marginBottom: "10px", textAlign: "center" }}>📊 AQI History Graph</h3>

      {/* 🔹 Dropdown */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <select
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setHoveredAQI(null);
          }}
          style={{
            padding: "6px 12px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Line Graph */}
      {aqiData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={aqiData}
            onMouseLeave={() => setHoveredAQI(null)}
            margin={{ top: 20, right: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value) => {
                setHoveredAQI(value);
                return [`AQI: ${value}`, "Air Quality"];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#8884d8"
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* 🔹 AQI Category */}
      {recommendation && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: recommendation.color,
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          🌫️ AQI: {effectiveAQI} — {recommendation.label}
        </div>
      )}
    </div>
  );
};

export default AQIGraph;
