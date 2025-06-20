const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  ProductID: {
    type: Number,
    required: true,
    unique: true
  },
  ProductName: {
    type: String,
    required: true
  },
  ProductBrand: {
    type: String,
    required: true
  },
  Gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex'],
    required: true
  },
  Price: {
    type: Number,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  PrimaryColor: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  stock: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    required: true
  },
  Category: {
    type: String,
    enum: ['Running Shoes', 'Basketball Shoes', 'Skateboarding Shoes', 'Tennis Shoes', 'Casual Shoes'],
    required: true
  }
}, {
  timestamps: true,
  strict: false // Allow extra fields during testing if needed
});

// ✅ FORCE Mongoose to use the 'product' collection (singular)
module.exports = mongoose.model('Product', productSchema, 'product');
