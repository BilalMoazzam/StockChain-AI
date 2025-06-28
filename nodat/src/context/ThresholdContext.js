import React, { createContext, useState, useContext, useEffect } from "react";

const ThresholdContext = createContext();

export const useThreshold = () => {
  return useContext(ThresholdContext);
};

export const ThresholdProvider = ({ children }) => {
  // Get the threshold from localStorage or set to 50 by default
  const savedThreshold = localStorage.getItem("threshold") || 50;

  const [threshold, setThreshold] = useState(Number(savedThreshold)); // Default threshold value

  // Update the threshold value
  const updateThreshold = (newThreshold) => {
    setThreshold(newThreshold);
    localStorage.setItem("threshold", newThreshold); // Save to localStorage
  };

  return (
    <ThresholdContext.Provider value={{ threshold, updateThreshold }}>
      {children}
    </ThresholdContext.Provider>
  );
};
