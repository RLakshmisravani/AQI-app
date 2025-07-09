import React, { useRef, useState } from "react";
import AQIGraph from "../components/AQIGraph";
import LatestAQICards from "../components/LatestAQICards";
import AQIMap from "../components/AQIMap";
import "./Home.css";

const Home = () => {
  const [selectedCity, setSelectedCity] = useState("Delhi");

  const graphRef = useRef(null);
  const mapRef = useRef(null);

  const handleCityClick = (cityName) => {
    setSelectedCity(cityName);
    setTimeout(() => {
      graphRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="home-container">
      <h2 className="home-title">AQI Dashboard</h2>

      {/* 🔘 Toggle Tabs */}
      <div className="home-tabs">
        <span onClick={() => graphRef.current?.scrollIntoView({ behavior: "smooth" })}>
          Visualize
        </span>
        <span onClick={() => mapRef.current?.scrollIntoView({ behavior: "smooth" })}>
          Heatmap
        </span>
      </div>

      {/* 📊 Graph */}
      <div ref={graphRef} className="graph-section">
        <AQIGraph selectedCity={selectedCity} setSelectedCity={setSelectedCity} />
      </div>

      {/* 🔹 AQI Cards */}
      <div className="cards-section">
        <LatestAQICards onCityClick={handleCityClick} />
      </div>

      {/* 🗺️ Map */}
      <div ref={mapRef} className="map-section">
        <AQIMap />
      </div>
    </div>
  );
};

export default Home;
