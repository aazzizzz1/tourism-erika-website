import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import customMarker from "../Data/mapssvg.svg"; // added import

const Maps = () => {
  const [map, setMap] = useState(null);
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [markersLayer, setMarkersLayer] = useState(null);

  // Define a custom icon using mapssvg
  const customIcon = L.icon({
    iconUrl: customMarker,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  useEffect(() => {
    if (!map) {
      if (L.DomUtil.get("map") !== null) {
        L.DomUtil.get("map")._leaflet_id = null;
      }
      // Set default view to Jogjakarta (approximate center) with a zoom level that focuses on the city
      const mapInstance = L.map("map").setView([-7.7956, 110.3695], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);
      setMap(mapInstance);
      const layer = L.layerGroup().addTo(mapInstance);
      setMarkersLayer(layer);
    }
  }, [map]);

  useEffect(() => {
    if (map && markersLayer) {
      markersLayer.clearLayers();
      data.forEach((location) => {
        if (
          !filterText ||
          (location.title &&
            location.title.toLowerCase().includes(filterText.toLowerCase()))
        ) {
          const marker = L.marker(
            [location.latitude, location.longitude],
            { icon: customIcon } // set custom icon
          );
          marker.bindPopup(`
            <div>
              <h3>${location.title}</h3>
              <p><strong>Category:</strong> ${location.category}</p>
              <p><strong>Address:</strong> ${location.address}</p>
              <p><strong>Rating:</strong> ${location.review_rating} (${location.review_count} reviews)</p>
              <a href="${location.link}" target="_blank">View on Maps</a>
            </div>
          `);
          marker.addTo(markersLayer);
        }
      });
    }
  }, [map, markersLayer, data, filterText]);

  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  return (
    <div className="relative">
      <div className="absolute z-10 p-4">
        <input
          type="text"
          placeholder="Filter by title..."
          className="border p-2 rounded"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <div id="map" className="w-full h-screen"></div>
    </div>
  );
};

export default Maps;