// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = require("../config/db"); // make sure this connects to your DB

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET // set this in your .env
      );
    } catch (err) {
      console.error("❌ Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Payment success hone par
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const payment_id = session.id;
      const email = session.customer_details?.email || session.customer_email;
      const amount = session.amount_total / 100;
      const status = session.payment_status;

      const sql =
        "INSERT INTO payments (payment_id, email, amount, status) VALUES (?, ?, ?, ?)";
      db.query(sql, [payment_id, email, amount, status], (err, result) => {
        if (err) {
          console.error("❌ DB Insert Error:", err);
        } else {
          console.log("✅ Payment saved to DB:", result.insertId);
        }
      });
    }

    res.json({ received: true });
  }
);

module.exports = router;
