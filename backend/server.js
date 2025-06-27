require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const errorHandler = require("./middleware/errorHandler");
const Product = require("./models/Product");
const Analytics = require("./models/Analytics");  // Import the Analytics model if required

// Routers
const productRouter     = require("./routes/api/productRouter");
const adminRouter       = require("./routes/admin");
const authRouter        = require("./routes/auth");
const usersRouter       = require("./routes/users");
const inventoryRouter   = require("./routes/inventory");
const ordersRouter      = require("./routes/orders");
const blockchainRouter  = require("./routes/blockchainRoutes");
const analyticsRouter   = require("./routes/api/analytics");  // Analytics router

const app = express();

/* ─── CORS SETUP ─── */
const corsOptions = {
  origin: "http://localhost:3000",            // React app
  credentials: true,                          // Allow cookies (if you ever use them)
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));           // Enable preflight for all routes

/* ─── BODY PARSERS ─── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── SESSION (optional) ─── */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,         // usually better to not save empty sessions
    
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000     // 24 hours in milliseconds
    }
  })
);

/* ─── ROUTES ─── */
app.use("/api/admin",      adminRouter);
app.use("/api/auth",       authRouter);
app.use("/api/users",      usersRouter);
app.use("/api/inventory",  inventoryRouter);
app.use("/api/products",   productRouter);
app.use("/api/orders",     ordersRouter);
app.use("/api/blockchain", blockchainRouter);
app.use("/api/analytics", analyticsRouter);  // Analytics route for charts and metrics

// Health check
app.get("/", (_, res) =>
  res.json({ message: "🟢 StockChain API is running!", version: "1.0.0" })
);

// 404 + central error handler
app.use((_, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

/* ─── DB CONNECTION & SERVER STARTUP ─── */
const connectDB = async () => {
  try {
    const LOCAL_URI = "mongodb://127.0.0.1:27017/clothing_store";
    const uri = process.env.MONGO_URI || LOCAL_URI;
    const opts = uri.startsWith("mongodb+srv")
      ? { dbName: "clothing_store" }
      : { dbName: "clothing_store", directConnection: true, serverSelectionTimeoutMS: 5000 };

    await mongoose.connect(uri, opts);
    console.log(`✅ MongoDB connected ➜ DB: ${mongoose.connection.name}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📁 Collections:", collections.map((c) => c.name));

    const productCount = await Product.countDocuments();
    console.log(`🛒 Products count: ${productCount}`);
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  const server = app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`)
  );

  // graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🛑 SIGINT received. Closing server…");
    await mongoose.disconnect();
    server.close(() => {
      console.log("👋 Server closed. Goodbye!");
      process.exit(0);
    });
  });
});
