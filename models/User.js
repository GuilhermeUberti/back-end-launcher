const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: String,
  stripeCustomerId: String,
  assinatura_ativa: { type: Boolean, default: false } 
});

module.exports = mongoose.model("User", userSchema);
