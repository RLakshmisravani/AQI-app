import React, { useEffect, useRef, useState } from "react";

// 🟩 AQI Category Color Mapping
function getAQICategory(aqi) {
  if (aqi <= 50) return { label: "Good", color: "#a8e6a3" };
  if (aqi <= 100) return { label: "Satisfactory", color: "#fff59d" };
  if (aqi <= 200) return { label: "Moderate", color: "#ffe082" };
  if (aqi <= 300) return { label: "Poor", color: "#ff8a65" };
  if (aqi <= 400) return { label: "Very Poor", color: "#ba68c8" };
  return { label: "Severe", color: "#d32f2f" };
}

const LatestAQICards = ({ onCityClick }) => {
  const [data, setData] = useState([]);
  const scrollRef = useRef(null);

  // 🔄 Fetch real-time AQI
  useEffect(() => {
    fetch("http://localhost:5000/latest-aqi")
      .then((res) => res.json())
      .then(setData);
  }, []);

  // 🔁 Auto-scroll horizontally
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const speed = 1; // pixels per step
    const intervalTime = 50; // ms per step

    const scroll = () => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
        container.scrollLeft = 0; // reset to start
      } else {
        container.scrollLeft += speed;
      }
    };

    const interval = setInterval(scroll, intervalTime);
    return () => clearInterval(interval);
  }, [data]);

  return (
    <div style={{ marginTop: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
        🌍 Real-Time AQI 
      </h2>
      <h3 style={{ textAlign: "center", marginBottom: "16px", opacity:0.5 }}>(Tap to View Graph)</h3>
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollBehavior: "smooth",
          padding: "12px",
          gap: "14px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Hide scrollbar on WebKit */}
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {data.map((item) => {
          const category = getAQICategory(item.aqi);
          return (
            <div
              key={item.city}
              onClick={() => onCityClick?.(item.city)}
              style={{
                backgroundColor: category.color,
                padding: "12px 16px",
                borderRadius: "10px",
                minWidth: "160px",
                textAlign: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                cursor: "pointer",
                flex: "0 0 auto",
              }}
            >
              <h4 style={{ margin: "6px 0" }}>{item.city}</h4>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                AQI: {item.aqi}
              </div>
              <div>{category.label}</div>
              <div style={{ fontSize: "12px", color: "#555" }}>{item.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LatestAQICards;
