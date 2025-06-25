// backend/models/PaymentStatusLog.js
const mongoose = require('mongoose');
const PaymentStatusLogSchema = new mongoose.Schema({
  time:     { type: Date,   default: Date.now },
  status:   String,
  name:     String,
  id:       String,
  size:     String,
  price:    String,
  sku:      String,
});
module.exports = mongoose.model('PaymentStatusLog', PaymentStatusLogSchema);
