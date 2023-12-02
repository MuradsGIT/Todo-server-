const jwt = require("jsonwebtoken");
require("dotenv").config();

function auth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log('Decoded Token:', decoded);

    req.user = { id: decoded.userId }; // Attach user information to the request
    
    next();
  } catch (error) {
    res.status(401).json({ errorMessage: "Unauthorized" });
  }
}

module.exports = auth;
