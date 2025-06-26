const express = require("express")
const Product = require("../../models/Product") // Ensure the path is correct
const router = express.Router()

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find() // Fetch all products

    // Dynamically set the stock status based on quantity for the response,
    // but DO NOT save it back to the database here.
    const formattedProducts = products.map((product) => ({
      ...product.toObject(), // Convert product document to a plain object
      status: product.quantity <= 0 ? "Out of Stock" : product.quantity <= 5 ? "Low Stock" : "In Stock", // Set stock status based on quantity
    }))

    res.status(200).json(formattedProducts) // Return the formatted products as a JSON response
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err })
  }
})

// Update a product by ID
router.put("/:id", async (req, res) => {
  try {
    // Find and update the product. `new: true` returns the updated document.
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" })
    }

    // DO NOT update `status` and save here. `status` is a derived frontend property.
    // If you need to update quantity, ensure req.body contains the new quantity.

    res.status(200).json(updatedProduct) // Return updated product
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err })
  }
})

// Delete a product by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id) // Delete product by ID
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.status(200).json({ message: "Product deleted successfully" }) // Return confirmation message
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err })
  }
})

module.exports = router
