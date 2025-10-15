// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = require("../config/db");

router.post(
  "/priyanshuwebhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook Signature Verification Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const payment_id = session.id;
      const email = session.customer_details?.email || session.customer_email;
      const amount = session.amount_total / 100;
      const status = session.payment_status;

      // ✅ Get userData from metadata
      const metadata = session.metadata || {};
      const userId = metadata.userId !== 'guest' ? metadata.userId : null;
      const phone = metadata.phone || null;
      const address = metadata.address || null;
      const city = metadata.city || null;
      const zipCode = metadata.zipCode || null;
      const customerName = metadata.customerName || session.customer_details?.name || null;

      console.log("📦 Metadata received:", metadata);

      try {
        // 🛍️ Fetch line items (products)
        const lineItems = await stripe.checkout.sessions.listLineItems(payment_id, {
          expand: ["data.price.product"],
          limit: 100,
        });

        // Convert line items to JSON
        const products = lineItems.data.map(item => ({
          name: item.description,
          quantity: item.quantity,
          price: item.price.unit_amount / 100,
          image: item.price?.product?.images?.[0] || null,
        }));

        const productsJSON = JSON.stringify(products);
        const total_items = products.reduce((acc, item) => acc + item.quantity, 0);

        const sql = `
          INSERT INTO orders 
          (user_id, full_name, email, phone, address, city, country, zip_code, 
           payment_id, amount, status, payment_method, products, total_items) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            userId, // ✅ From metadata
            customerName, // ✅ From metadata or Stripe
            email,
            phone, // ✅ From metadata
            address, // ✅ From metadata
            city, // ✅ From metadata
            session.shipping_details?.address?.country || 'IL', // Default to Israel
            zipCode, // ✅ From metadata
            payment_id,
            amount,
            status,
            "Stripe",
            productsJSON,
            total_items,
          ],
          (err, result) => {
            if (err) {
              console.error("❌ DB Insert Error:", err);
              return res.status(500).send('Database error');
            } else {
              console.log("✅ Order saved to DB with ID:", result.insertId);
              console.log("✅ User Data:", { userId, customerName, phone, address, city, zipCode });
            }
          }
        );

      } catch (error) {
        console.error("❌ Error processing checkout session:", error);
        return res.status(500).send("Internal server error during processing.");
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;