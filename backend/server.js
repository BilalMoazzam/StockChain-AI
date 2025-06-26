require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const errorHandler = require("./middleware/errorHandler")
const Product = require("./models/Product") // Ensure Product model is imported
const session = require("express-session")

// Import the correct router based on your project structure
const productRouter = require("./routes/api/productRouter") // Correctly imported router

const app = express()
// const blockchainRoutes = require('./routes/blockchainRoutes'); // This import is not used here, can be removed if not used elsewhere in server.js

/* ───────────────── GLOBAL MIDDLEWARES ───────────────── */
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use the secret from .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 60000 },
  }),
)

/* ───────────────── ROUTES ───────────────── */
app.use("/api/admin", require("./routes/admin"))
app.use("/api/auth", require("./routes/auth"))
app.use("/api/users", require("./routes/users"))
app.use("/api/inventory", require("./routes/inventory"))
app.use("/api/products", productRouter) // This registers the productRouter correctly.
app.use("/api/orders", require("./routes/orders"))
app.use("/api/blockchain", require("./routes/blockchainRoutes"))

// REMOVED: The duplicate app.get('/api/products') route.
// The productRouter (imported above) should handle all /api/products routes.

// Health check
app.get("/", (_, res) => res.json({ message: "🟢 StockChain API is running!", version: "1.0.0" }))

// 404 + error handler
app.use((_, res) => res.status(404).json({ message: "Route not found" }))
app.use(errorHandler)

/* ───────────────── DB CONNECTION ───────────────── */
const connectDB = async () => {
  try {
    const LOCAL_URI = "mongodb://127.0.0.1:27017/clothing_store"
    const uri = process.env.MONGO_URI || LOCAL_URI

    const opts = uri.startsWith("mongodb+srv")
      ? { dbName: "clothing_store" }
      : { dbName: "clothing_store", directConnection: true, serverSelectionTimeoutMS: 5000 }

    await mongoose.connect(uri, opts)
    console.log(`✅ MongoDB connected ➜ DB: ${mongoose.connection.name}`)

    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "📁 Collections:",
      collections.map((c) => c.name),
    )

    const productCount = await Product.countDocuments()
    console.log(`🛒 Products count: ${productCount}`)
  } catch (err) {
    console.error("❌ Database connection error:", err.message)
    process.exit(1)
  }
}

/* ───────────────── START SERVER ───────────────── */
const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()
  const server = app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`),
  )

  process.on("SIGINT", async () => {
    console.log("\n🛑 SIGINT received. Closing server…")
    await mongoose.disconnect()
    server.close(() => {
      console.log("👋 Server closed. Goodbye!")
      process.exit(0)
    })
  })
}

startServer()
