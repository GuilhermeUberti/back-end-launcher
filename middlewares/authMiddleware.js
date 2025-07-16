const jwt = require("jsonwebtoken");

/**
 * Middleware que verifica token JWT e, opcionalmente, exige assinatura ativa.
 * 
 * @param {Object} [options] - Configurações adicionais
 * @param {boolean} [options.assinaturaObrigatoria=false] - Se true, exige assinatura ativa
 */
function authMiddleware(options = {}) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        sucesso: false,
        msg: "Token não fornecido ou formato inválido",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔐 Token decodificado:", decoded); // <-- AGORA sim está no lugar certo

      req.user = decoded;

      if (options.assinaturaObrigatoria && !decoded.assinatura_ativa) {
        return res.status(403).json({
          sucesso: false,
          msg: "Assinatura inativa",
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        sucesso: false,
        msg: "Token inválido ou expirado",
      });
    }
  };
}

module.exports = authMiddleware;
