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
    } catch (err)      {
      console.error("❌ Webhook Signature Verification Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const payment_id = session.id;
      const email = session.customer_details?.email || session.customer_email;
      const amount = session.amount_total / 100;
      const status = session.payment_status;

      try {
        // 🛍️ Fetch line items (products)
        // ✅ CHANGE 1: Use `expand` to include the product data for each line item.
        // This is crucial to get access to the product's name and image.
        const lineItems = await stripe.checkout.sessions.listLineItems(payment_id, {
          expand: ["data.price.product"],
          limit: 100, //  limit as needed
        });

        // Convert line items to JSON string for DB
        // ✅ CHANGE 2: Update the mapping to access the expanded product data.
        const products = lineItems.data.map(item => ({
          name: item.description, // `description` is the product name you passed
          quantity: item.quantity,
          price: item.price.unit_amount / 100, // Price per single item
          // The image is inside the expanded `product` object.
          // `images` is an array, so we take the first one.
          // Using optional chaining (?.) for safety in case the data is missing.
          image: item.price?.product?.images?.[0] || null,
        }));

        const productsJSON = JSON.stringify(products);
        const total_items = products.reduce((acc, item) => acc + item.quantity, 0);

        const sql = `
          INSERT INTO orders 
          (full_name, email, phone, address, city, country, zip_code, 
           payment_id, amount, status, payment_method, products, total_items) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Note: It's recommended to pass customer details from the frontend
        // and store them in the session's `metadata` for retrieval here.
        db.query(
          sql,
          [
            session.customer_details?.name || null, // Get name if available
            email,
            session.customer_details?.phone || null, // Get phone if available
            session.shipping_details?.address?.line1 || null,
            session.shipping_details?.address?.city || null,
            session.shipping_details?.address?.country || null,
            session.shipping_details?.address?.postal_code || null,
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
              // It's good practice to send a 500 error back to Stripe if the DB fails,
              // so Stripe knows the event was not processed and will try again.
              // res.status(500).send('Database error');
              // return; // Stop execution
            } else {
              console.log("✅ Order saved to DB:", result.insertId);
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