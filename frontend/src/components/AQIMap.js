import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";

// ✅ URLs to public data
const geoUrl = "/india-states.geojson";
const cityCoordUrl = "/city-coordinates.json";

// ✅ AQI color mapping
const getAQIColor = (aqi) => {
  if (aqi <= 50) return "#66bb6a";        // Good
  if (aqi <= 100) return "#ffee58";       // Satisfactory
  if (aqi <= 200) return "#ffca28";       // Moderate
  if (aqi <= 300) return "#ff7043";       // Poor
  if (aqi <= 400) return "#ab47bc";       // Very Poor
  return "#d32f2f";                       // Severe
};

const AQIMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [cities, setCities] = useState([]);
  const [aqiData, setAqiData] = useState([]);

  // 🌐 Load GeoJSON + City coordinates + AQI
  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then(setGeoData);

    fetch(cityCoordUrl)
      .then((res) => res.json())
      .then(setCities);

    fetch("https://aqi-app-x8fq.onrender.com/latest-aqi")
      .then((res) => res.json())
      .then(setAqiData);
  }, []);

  // 🔁 Match AQI with coordinates
  const cityPoints = cities
    .map((city) => {
      const aqiEntry = aqiData.find(
        (entry) => entry.city.toLowerCase() === city.name.toLowerCase()
      );
      return aqiEntry
        ? { ...city, aqi: aqiEntry.aqi, date: aqiEntry.date }
        : null;
    })
    .filter(Boolean);

  return (
    <div style={{ marginTop: "40px", textAlign: "center" }}>
      

      {geoData && (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1000, center: [82.8, 22.6] }}
          width={1000}
          height={600}
          style={{ margin: "0 auto" }}
        >
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "#f8f9fa",
                      stroke: "#444",
                      strokeWidth: 0.75,
                      outline: "none",
                    },
                    hover: {
                      fill: "#e0e0e0",
                      stroke: "#333",
                      strokeWidth: 1,
                      outline: "none",
                    },
                    pressed: {
                      fill: "#ccc",
                      stroke: "#111",
                      strokeWidth: 1,
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {/* 🔴 City AQI markers */}
          {cityPoints.map((city, index) => (
            <Marker
              key={index}
              coordinates={[city.lon, city.lat]}
              data-tooltip-id="map-tooltip"
              data-tooltip-html={`<strong>${city.name}</strong><br/>AQI: ${city.aqi}<br/>${city.date}`}
            >
              <circle
                r={5}
                fill={getAQIColor(city.aqi)}
                stroke="#fff"
                strokeWidth={1.5}
              />
            </Marker>
          ))}
        </ComposableMap>
      )}

      {/* 📌 Tooltip for hover info */}
      <Tooltip id="map-tooltip" />
    </div>
  );
};

export default AQIMap;
