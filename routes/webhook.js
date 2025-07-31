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
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "checkout.session.completed": {
        const session = data.object;
        const stripeCustomerId = session.customer;

        const user = await User.findOne({ stripeCustomerId });
        if (user) {
          user.assinatura_ativa = true;
          await user.save();
          console.log(`✅ Assinatura ativada para ${user.email}`);
        }
        break;
      }

      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const subscription = data.object;
        const stripeCustomerId = subscription.customer;

        const user = await User.findOne({ stripeCustomerId });
        if (user) {
          user.assinatura_ativa = false;
          await user.save();
          console.log(`❌ Assinatura desativada para ${user.email}`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Evento não tratado: ${type}`);
    }
  } catch (err) {
    console.error("🔥 Erro ao processar evento do webhook:", err.message);
    return res.status(500).send("Erro interno ao processar webhook.");
  }

  return res.status(200).json({ received: true });
});

module.exports = router;
