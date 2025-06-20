// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const mongoose = require("mongoose"); // Add this line

// GET /api/products
// routes/productRoutes.js

// In your productRoutes.js
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean();
    const formattedProducts = products.map((p) => ({
      id: p._id,
      name: p.ProductName,
      brand: p.ProductBrand,
      gender: p.Gender,
      price: p.Price,
      description: p.Description,
      color: p.PrimaryColor,
      quantity: p.quantity,
      stock: p.stock,
      category: p.Category,
    }));

    res.json(formattedProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// In productRoutes.js
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find().skip(skip).limit(limit);
  console.log(limit);
  const total = await Product.countDocuments();

  res.json({
    data: products,
    meta: { page, limit, total },
  });
});
module.exports = router;
