// src/components/pages/ForecastingSettings.jsx
import React, { useState, useEffect } from "react";
import { useThreshold } from "../../context/ThresholdContext"; // Import context

// Recharts imports
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ForecastingSettings = () => {
  const { threshold, updateThreshold } = useThreshold();  // Get threshold from context
  const [tempThreshold, setTempThreshold] = useState(threshold); // Temporary threshold state for the slider
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    const lineData = [];
    for (let i = 0; i < 12; i++) {
      const value = Math.floor(Math.random() * 50) + 30;
      lineData.push({
        name: `Month ${i + 1}`,
        value: value,
        forecast: value + (Math.random() * 20 - 10),
      });
    }
    setForecastData(lineData);
    setLoading(false);
  };

  // Update the threshold state when the slider changes
  const handleThresholdChange = (e) => {
    const newThreshold = Number(e.target.value);
    setTempThreshold(newThreshold); // Update temporary state for the slider
  };

  // Handle saving the threshold
  const handleSave = () => {
    updateThreshold(tempThreshold); // Save the new threshold to the context
    alert("Forecasting settings saved!");
  };

  return (
    <div className="settings-section forecasting-settings">
      <div className="section-header">
        <h2>Forecasting Settings</h2>
      </div>

      <div className="threshold-control">
        <label>Normal Threshold</label>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={tempThreshold} // Bind the slider value to the temp state
            onChange={handleThresholdChange} // Handle slider change
            className="threshold-slider"
          />
          <span className="threshold-value">{tempThreshold}%</span>
        </div>
      </div>

      <div className="forecasting-charts">
        <div className="chart-container">
          {loading ? (
            <div className="chart-loading">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#FFC107" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3 }} name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="section-footer">
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default ForecastingSettings;
