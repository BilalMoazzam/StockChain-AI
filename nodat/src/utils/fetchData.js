// utils/fetchData.js

export const fetchAnalyticsData = async () => {
  try {
    const [metricsResponse, chartDataResponse] = await Promise.all([
      fetch("http://localhost:5000/api/analytics/metrics"),
      fetch("http://localhost:5000/api/analytics/chartData"),
    ]);

    const metricsData = await metricsResponse.json();
    const chartData = await chartDataResponse.json();

    return { metricsData, chartData };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
