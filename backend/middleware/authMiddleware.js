const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret");

    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role,
      email: decoded.email
    };

    if (!req.user.id) {
      return res.status(401).json({ message: "Unauthorized: invalid token payload" });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

module.exports = { authMiddleware };
