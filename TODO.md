# TODO for Stripe Payment Integration

- [x] Add POST endpoint "/create-checkout-session" in paymentRoutes.js
  - Accept product details (name, price, quantity)
  - Create Stripe checkout session with required parameters
  - Return session ID as JSON
  - Add error handling
- [x] Add webhook endpoint "/webhook" in paymentRoutes.js
  - Verify Stripe webhook signature
  - Handle checkout.session.completed event to update payment status
- [x] Test the endpoints (run server and verify functionality)
