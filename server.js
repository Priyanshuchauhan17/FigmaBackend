// server.js (ya index.js)
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

// Existing routes
const productRoutes = require("./routes/productroutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); 
const orderRoutes = require("./routes/orderroute");


const app = express();
const FRONTEND_URL = "http://localhost:5173";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({ origin: FRONTEND_URL, methods: ["GET", "POST"] }));

// ⚠️ important: webhook route se pehle normal express.json na lagaye
app.use("/api/payment", paymentRoutes);

// Normal routes ke liye json
app.use(express.json());

// Stripe checkout session create
app.post("/api/payment/create-checkout-session", async (req, res) => {
  try {
    const { cartItems  } = req.body;

    if (!cartItems  || !Array.isArray(cartItems )) {
      return res.status(400).json({ error: "Invalid cartItems  array" });
    }

    const lineItems = cartItems .map((item) => ({
      price_data: {
        currency: "ILS",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${FRONTEND_URL}/success`,
      cancel_url: `${FRONTEND_URL}/cancel`,
    });

    console.log("✅ Checkout Session Created:", session.id);
    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("❌ Stripe Error:", err.message);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
});

// Other routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
