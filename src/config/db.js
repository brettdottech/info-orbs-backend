const {Sequelize} = require("sequelize");
require("dotenv").config(); // Load .env file
require("dotenv").config({path: ".env.local", override: true}); // Load .env.local and override settings from .env

// console.log(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, process.env.DB_HOST);

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//     host: process.env.DB_HOST,
//     dialect: process.env.DB_DIALECT,
//     logging: false
// });

// console.log(process.env.DB_URI);
//
const sequelize = new Sequelize(process.env.DB_URI, {
    ssl: true,
    logging: true,
});

module.exports = sequelize;