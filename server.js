require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ⚠️ Webhook precisa ser antes do express.json()
app.use("/api/webhook", require("./routes/webhook"));

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"], 
}));
app.use(express.json());

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB Atlas"))
  .catch(err => console.error("❌ Erro ao conectar ao MongoDB Atlas:", err));

// Rotas públicas
app.use("/api/auth", require("./routes/auth"));

// Rotas protegidas
app.use("/api/user", require("./routes/user")); // /api/user/profile
app.use("/api/download-launcher", require("./routes/download")); // /api/download-launcher

// Rota de checkout com Stripe
app.use("/api/checkout", require("./routes/checkout")); // /api/checkout

// ✅ Nova rota de contato por e-mail
app.use("/api/email", require("./routes/email")); // /api/email/contato

// Rota raiz
app.get("/", (req, res) => {
  res.send("🚀 Backend está rodando!");
});

// Inicializa servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
