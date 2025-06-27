const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");

router.get("/optimized", async (req, res) => {
  try {
    // Aggregation for Metrics (total sales, stock status)
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: { $multiply: ["$quantity", "$Price"] } },
          inStock: { $sum: { $cond: [{ $eq: ["$stock", "In Stock"] }, 1, 0] } },
          lowStock: { $sum: { $cond: [{ $eq: ["$stock", "Low Stock"] }, 1, 0] } },
          outStock: { $sum: { $cond: [{ $eq: ["$stock", "Out of Stock"] }, 1, 0] } },
        }
      }
    ]);

    // Predictions (including AI predictions)
    const predictions = await Product.aggregate([
  {
    $project: {
      ProductID: 1,
      ProductName: 1,
      quantity: 1,
      Price: 1,
      stock: {
        $cond: [
          { $eq: ["$quantity", 0] },
          "Out of Stock",
          { $cond: [{ $lt: ["$quantity", 100] }, "Low Stock", "In Stock"] }
        ]
      },
      ai_prediction: 1,  // Make sure this field is populated correctly
    }
  }
]);


    // Best Selling Product Calculation
    const bestSellingProduct = predictions.reduce((best, current) => {
      const currentTotalSales = current.quantity * current.Price;
      if (currentTotalSales > best.totalSales) {
        return {
          product: current.ProductName,
          totalSales: currentTotalSales
        };
      }
      return best;
    }, { product: "N/A", totalSales: 0 });

    // Return the aggregated stats and predictions with best-selling product
    res.json({
      stats: stats[0], // stats like total sales, stock
      predictions,
      bestSellingProduct: bestSellingProduct.product,
    });
  } catch (err) {
    console.error("Error fetching analytics data:", err);
    res.status(500).json({ message: "Failed to fetch analytics data" });
  }
});

module.exports = router;
