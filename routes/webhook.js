const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const User = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const stripeCustomerId = session.customer;

    try {
      const user = await User.findOne({ stripeCustomerId });
      if (user) {
        user.assinatura_ativa = true;
        await user.save();
        console.log(`✅ Assinatura ativada para ${user.email}`);
      }
    } catch (err) {
      console.error("Erro ao atualizar assinatura:", err.message);
    }
  }

  res.json({ received: true });
});

module.exports = router;
