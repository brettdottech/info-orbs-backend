const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");

const Clock = sequelize.define("Clock", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    name: {type: DataTypes.STRING, allowNull: false},
    author: {type: DataTypes.STRING, allowNull: true},
    url: {type: DataTypes.STRING, allowNull: true},
    description: {type: DataTypes.TEXT},
    userId: {type: DataTypes.STRING, allowNull: false},
    downloads: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
    secondHandColor: {type: DataTypes.STRING, allowNull: false},
    approved: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
    approvedBy: {type: DataTypes.STRING, allowNull: true},
}, {timestamps: true});

module.exports = Clock;