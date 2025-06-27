const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  totalSales: {
    type: Number,
    default: 0,
  },
  bestSellingProduct: {
    type: String,
    default: "N/A",
  },
  inventoryHealth: {
    type: Number,
    default: 0,
  },
  stockStatusData: [
    {
      name: { type: String },
      count: { type: Number },
    },
  ],
  aiPredictionData: [
    {
      name: { type: String },
      count: { type: Number },
    },
  ],
});

const Analytics = mongoose.model("Analytics", analyticsSchema);
module.exports = Analytics;
