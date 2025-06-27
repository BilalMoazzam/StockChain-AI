// frontend/src/utils/api.js

export const fetchAnalyticsData = async (dateRange) => {
  try {
    const res = await fetch(`http://localhost:5000/api/analytics/ai-inventory?range=${dateRange}`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();

    // Metrics
    let totalSales = 0;
    let best = { name: "N/A", value: 0 };
    let inStock = 0, lowStock = 0, outStock = 0;

    data.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.Price) || 0;
      const val = qty * price;

      totalSales += val;
      if (val > best.value) best = { name: item.ProductName, value: val };

      if (item.stock === "In Stock") inStock++;
      else if (item.stock === "Low Stock") lowStock++;
      else if (item.stock === "Out of Stock") outStock++;
    });

    const aiPredictionChartData = data.reduce((acc, item) => {
      const key = item.ai_prediction || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      metrics: {
        totalSales,
        bestSellingProduct: best.name,
        inventoryHealth: ((inStock + lowStock) / data.length) * 100,
      },
      salesData: [], // You can further process this
      inventoryData: [], // You can further process this
      aiPredictions: data,
      aiPredictionChartData,
      stockStatusChartData: [
        { name: "In Stock", count: inStock },
        { name: "Low Stock", count: lowStock },
        { name: "Out of Stock", count: outStock },
      ],
    };
  } catch (err) {
    console.error("Fetch error:", err);
    return {
      metrics: { totalSales: 0, bestSellingProduct: "N/A", inventoryHealth: 0 },
      salesData: [],
      inventoryData: [],
      aiPredictions: [],
      aiPredictionChartData: [],
      stockStatusChartData: [],
    };
  }
};
