const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  const { assinatura_ativa } = req.user;

  if (!assinatura_ativa) {
    return res.status(403).json({ sucesso: false, msg: "Assinatura inativa" });
  }

  // Redirecionar para o link do GitHub
  const githubDownloadURL =
    "https://github.com/GuilhermeUberti/giftplay-installer/releases/download/v1.0.0/GiftPlayInstaller.exe";

  return res.redirect(githubDownloadURL);
});

module.exports = router;
