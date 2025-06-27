const express = require('express');
const session = require('express-session');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getInventoryStats,
  getLowStockAlerts
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

const router = express.Router();

// Initialize session middleware
router.use(session({
  secret: 'your-secret-key',  // Make sure this key is secure
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true }  // Cookies settings (ensure 'secure' is true in production with HTTPS)
}));

// Protect all routes below this line
router.use(protect);  // All routes will require authentication

// GET: List all products
router.route('/')
  .get(getProducts)  // Controller handles fetching all products
  .post(validateProduct, createProduct);  // Create new product with validation

// GET: Inventory stats (for reporting or analytics)
router.get('/stats', getInventoryStats);

// GET: Low stock alerts
router.get('/alerts', getLowStockAlerts);

router.get("/", async (req, res) => {
  const data = await Inventory.find({ /* ... */ });
  res.json({ data, total: data.length });
});

// GET, PUT, DELETE: Handle individual product routes
router
  .route('/:id')
  .get(getProduct)  // Get individual product
  .put(validateProduct, updateProduct)  // Update product
  .delete(authorize('Admin', 'Manager'), deleteProduct);  // Delete product (authorized roles)

// PUT: Update stock for a specific product
// PUT: Update stock for a specific product
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityOrdered } = req.body;  // The quantity ordered to update stock

    // Find the product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Temporarily reduce the stock in session (optional)
    req.session.tempStock = req.session.tempStock || {};
    if (req.session.tempStock[id]) {
      req.session.tempStock[id] -= quantityOrdered;  // Reduce stock from session temporarily
    } else {
      req.session.tempStock[id] = product.quantity - quantityOrdered; // Set initial value
    }

    // Update product quantity and status in the database (or session)
    product.quantity -= quantityOrdered;  // Deduct stock from product

    // Calculate the new status based on the updated quantity
    const LOW_STOCK_THRESHOLD = 5;
    let status = "In Stock";  // Default status

    if (product.quantity <= 0) {
      status = "Out of Stock";
    } else if (product.quantity <= LOW_STOCK_THRESHOLD) {
      status = "Low Stock";
    }

    // Update status in the database
    product.status = status;
    await product.save();

    res.status(200).json({
      message: `Stock updated successfully for product ID: ${id}. New stock: ${product.quantity}`,
      stock: product.quantity,
      status: product.status  // Return the updated stock status
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating stock', error: err });
  }
});


// Reset session data when user logs out (clear tempStock)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out', error: err });
    }

    // Optionally clear session cookie to ensure that the session data is wiped
    res.clearCookie('connect.sid');  // Clear the session cookie

    res.status(200).json({ message: 'User logged out successfully' });
  });
});

module.exports = router;
