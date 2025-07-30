const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const User = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ msg: "Email obrigatório" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Usuário não encontrado" });
    console.log("Usuário encontrado:", user);


    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: user.stripeCustomerId,
      line_items: [
        {
          price: "price_1RqaQT09kb8iFzjuNhPBQkFk", // ID do plano mensal no Stripe    
          quantity: 1,       
        },
      ],
      success_url: process.env.FRONT_SUCCESS_URL,
      cancel_url: process.env.FRONT_CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Erro ao criar sessão de assinatura:", err);
    res.status(500).json({ msg: "Erro ao criar assinatura" });
  }
});

module.exports = router;
