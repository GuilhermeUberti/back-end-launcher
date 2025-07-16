const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/profile", authMiddleware(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ sucesso: false, msg: "Usuário não encontrado" });
    }

    // Verifica assinatura ativa no Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 1,
    });

    const assinaturaAtiva = subscriptions.data.length > 0;

    return res.json({
      sucesso: true,
      usuario: {
        id: user._id,
        name: user.name,
        email: user.email,
        assinatura_ativa: assinaturaAtiva,
      },
    });

  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    return res.status(500).json({ sucesso: false, msg: "Erro no servidor" });
  }
});

module.exports = router;
