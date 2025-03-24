// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
//
// exports.register = async (req, res) => {
//     const {username, email, password} = req.body;
//     console.log(req.body);
//     const hashedPassword = await bcrypt.hash(password, 10);
//     try {
//         const user = await User.create({username, email, password_hash: hashedPassword});
//         res.json({msg: "User registered"});
//         console.log("User registered: " + user.email);
//     } catch (err) {
//         res.status(400).json({error: err.message});
//     }
// };
//
// exports.login = async (req, res) => {
//     const {email, password} = req.body;
//     const user = await User.findOne({where: {email}});
//     if (!user || !(await bcrypt.compare(password, user.password_hash))) {
//         console.warn("Invalid credentials for user " + email + "");
//         res.status(401).json({msg: "Invalid credentials"});
//         return;
//     }
//     const token = jwt.sign({
//         id: user.id,
//         username: user.username,
//         isAdmin: user.isAdmin
//     }, process.env.JWT_SECRET, {expiresIn: "24h"});
//     console.log("Token created for user " + email);
//     res.json({token});
// };