const Clock = require("./Clock");
const Like = require("./Like");
// const User = require("./User");

// Define associations here
Clock.hasMany(Like, {foreignKey: "clockId", onDelete: "CASCADE"});
Like.belongsTo(Clock, {foreignKey: "clockId", onDelete: "CASCADE"});

// Like.belongsTo(User, {foreignKey: "userId", onDelete: "CASCADE"});

// User.hasMany(Clock, {foreignKey: "userId", onDelete: "CASCADE"}); // Optional
// Clock.belongsTo(User, {foreignKey: "userId", onDelete: "CASCADE"}); // Optional

// Export models and sequelize
module.exports = {Clock, Like};