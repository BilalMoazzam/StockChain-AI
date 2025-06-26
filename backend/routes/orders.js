const express = require('express');
const session = require('express-session');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');
  // Ensure correct path
const Product = require('../models/Product');


const router = express.Router();

// Initialize session middleware
router.use(session({
  secret: 'your-secret-key', // Ensure this key is secure
  resave: false,
  saveUninitialized: true,
}));

// 1) Public: anyone can list orders
router.get('/', getOrders);

// 2) All remaining routes require authentication
router.use(protect);

router.post('/', validateOrder, createOrder);
router.get('/stats', getOrderStats);

// Handle an order and temporarily reduce product quantity
router.post('/order', async (req, res) => {
  try {
    const { productId, quantityOrdered } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate total price
    const totalAmount = product.Price * quantityOrdered;

    // Create the order with the correct total
    const newOrder = new Order({
      productId,
      quantity: quantityOrdered,
      totalPrice: totalAmount,
      user: req.user._id, // Assuming user is logged in
    });

    await newOrder.save();  // Save the order to DB
    res.status(200).json(newOrder);  // Return the saved order
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err });
  }
});


// Handle updating order status
router.put('/:id/status', updateOrderStatus);

// Handle an individual order (GET, PUT, DELETE)
router
  .route('/:id')
  .get(getOrder)
  .put(updateOrder)
  .delete(authorize('Admin', 'Manager'), deleteOrder);

// Reset session data when user logs out
// routes/api/orderRouter.js (or in your logout route)

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out', error: err });
    }

    // Optional: Clear session cookie to ensure that the session data is completely wiped
    res.clearCookie('connect.sid');  // Clear the session cookie

    res.status(200).json({ message: 'User logged out successfully' });
  });
});



module.exports = router;
