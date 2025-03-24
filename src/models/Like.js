const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");

const Like = sequelize.define("Like", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    clockId: {type: DataTypes.INTEGER, allowNull: false},
    userId: {type: DataTypes.STRING, allowNull: false},
}, {
    timestamps: true,
    indexes: [
        {
            unique: true, // Enforce unique constraint on the combination of user_id and clock_id
            fields: ["userId", "clockId"], // Columns in the unique constraint
            name: "clock_user_unique", // Optional: provide a name for the index
        },
    ],
});

module.exports = Like;