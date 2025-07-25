const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");

router.get("/profile", authMiddleware(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ sucesso: false, msg: "Usuário não encontrado" });
    }

    // Usa o campo salvo no banco de dados, que é atualizado via webhook
    return res.json({
      sucesso: true,
      usuario: {
        id: user._id,
        name: user.name,
        email: user.email,
        assinatura_ativa: user.assinatura_ativa,
      }, 
    });

  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    return res.status(500).json({ sucesso: false, msg: "Erro no servidor" });
  }
});

module.exports = router;
