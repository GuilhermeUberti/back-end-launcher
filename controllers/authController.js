const User = require("../models/User"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ sucesso: false, msg: "Usuário não encontrado" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ sucesso: false, msg: "Senha incorreta" });
    }

    // Verifica assinatura ativa no Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 1
    });

    const assinaturaAtiva = subscriptions.data.length > 0;

    // Gera token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      sucesso: true,
      acesso: assinaturaAtiva,
      assinatura_ativa: assinaturaAtiva,
      name: user.name,
      token
    });

  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ sucesso: false, msg: "Erro no servidor" });
  }
};

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ sucesso: false, msg: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria cliente no Stripe
    const stripeCustomer = await stripe.customers.create({ email });

    // Salva novo usuário
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      stripeCustomerId: stripeCustomer.id
    });

    await newUser.save();

    res.status(201).json({ sucesso: true, msg: "Usuário registrado com sucesso" });

  } catch (err) {
    console.error("❌ Erro completo:", err);
    res.status(500).json({ sucesso: false, msg: "Erro ao registrar usuário", erro: err.message });
  }
};
