const express = require("express");
const path = require("path");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  const { assinatura_ativa } = req.user;

  if (!assinatura_ativa) {
    return res.status(403).json({ sucesso: false, msg: "Assinatura inativa" });
  }

  const launcherPath = path.join(__dirname, "../files/GiftPlayLauncher.exe");
  res.download(launcherPath, "GiftPlayLauncher.exe");
});

module.exports = router;
