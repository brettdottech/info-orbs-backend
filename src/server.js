const express = require("express");
const sequelize = require("./config/db");
const cors = require("cors");
require("dotenv").config(); // Load .env file
require("dotenv").config({path: ".env.local", override: true}); // Load .env.local and override settings from .env

console.log(process.env.DB_URI);

const app = express();
app.set('trust proxy', 1 /* number of proxies between user and server */)

app.use(express.json());
app.use(cors());

// app.use("/api/auth", require("./routes/auth"));
console.log("Setting up clocks routes");
app.use("/api/clocks", require("./routes/clocks"));
console.log("Setting up likes routes");
app.use("/api/likes", require("./routes/likes"));
console.log("Setting up uploads routes");
app.use("/api/uploads", require("./routes/uploads"));
console.log("Setting up images routes");
app.use("/api/images", require("./routes/images"));

const connectWithRetry = async (retries = 5, delay = 5000) => {
    while (retries) {
        try {
            await sequelize.sync({ alter: true });
            console.log("Database connected");
            break;
        } catch (err) {
            console.error(err);
            retries -= 1;
            console.error(`Database connection failed. Retries left: ${retries}`);
            if (retries === 0) {
                console.error("All retries failed. Exiting...");
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

connectWithRetry();

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));