// routes/checkout.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { default: mongoose } = require("mongoose");
const User = require("../models/User");

console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY); // remova depois do teste
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ msg: "Email obrigatório" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Usuário não encontrado" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: user.stripeCustomerId, // já está no seu banco!
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Pacote GiftPlay",
              description: "Assinatura para liberar o launcher",
            },
            unit_amount: 1, // R$19,90
          },
          quantity: 50,
        },
      ],
      success_url: process.env.FRONT_SUCCESS_URL,
      cancel_url: process.env.FRONT_CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Erro ao criar checkout:", err.message);
    res.status(500).json({ msg: "Erro ao criar checkout" });
  }
});

module.exports = router;
