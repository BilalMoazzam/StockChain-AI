// // This is where you should place the content of the reset-product-quantities.js script.
// // The full path will be: backend/scripts/reset-product-quantities.js

// require("dotenv").config({ path: "./config/config.env" }) // Ensure dotenv loads your MONGO_URI
// const mongoose = require("mongoose")
// const Product = require("../models/Product") // Corrected path relative to backend/scripts

// async function resetProductQuantities() {
//   try {
//     const LOCAL_URI = "mongodb://127.0.0.1:27017/clothing_store"
//     const uri = process.env.MONGO_URI || LOCAL_URI

//     const opts = uri.startsWith("mongodb+srv")
//       ? { dbName: "clothing_store" }
//       : { dbName: "clothing_store", directConnection: true, serverSelectionTimeoutMS: 5000 }

//     await mongoose.connect(uri, opts)
//     console.log("✅ MongoDB connected for quantity reset.")

//     const defaultQuantity = 100 // Set your desired default quantity here

//     // Update all products to the default quantity
//     const result = await Product.updateMany(
//       {}, // Filter: empty object to select all documents
//       { $set: { quantity: defaultQuantity } }, // Update: set quantity to defaultQuantity
//     )

//     console.log(`✅ Successfully reset quantities for ${result.modifiedCount} products.`)
//     console.log(`All products now have a quantity of ${defaultQuantity}.`)
//   } catch (error) {
//     console.error("❌ Error resetting product quantities:", error)
//   } finally {
//     await mongoose.disconnect()
//     console.log("👋 MongoDB connection closed.")
//   }
// }

// resetProductQuantities()
