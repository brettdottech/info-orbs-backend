require("dotenv").config(); // Load .env file
require("dotenv").config({path: ".env.local", override: true}); // Load .env.local and override settings from .env

// const jwt = require("jsonwebtoken");
//
// module.exports = (req, res, next) => {
//     // Get Authorization header
//     const authHeader = req.header("Authorization");
//     if (!authHeader) {
//         return res.status(401).json({msg: "No token, authorization denied"});
//     }
//
//     // Ensure the token starts with 'Bearer ' and extract the token
//     if (!authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({msg: "Invalid token format"});
//     }
//
//     // Extract the token
//     const token = authHeader.split(" ")[1];
//
//     try {
//         // console.log("Token received:", token);
//
//         // Verify the token using the secret
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//
//         // console.log("Decoded token:", decoded);
//         req.user = decoded; // Attach decoded token payload to req.user
//         next();
//     } catch (err) {
//         console.error("Token verification error:", err.message);
//         res.status(401).json({msg: "Invalid token"});
//     }
// };

const kindeAuthExpress = require("@kinde-oss/kinde-node-express-api")

let authenticate;
(async () => {
    authenticate = await kindeAuthExpress(process.env.KINDE_DOMAIN)
})();

module.exports = (req, res, next) => {
    console.log("Authenticating...")
    authenticate(req, res, next);
};