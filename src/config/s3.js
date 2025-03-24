const {S3Client} = require("@aws-sdk/client-s3");
require("dotenv").config(); // Load .env file
require("dotenv").config({path: ".env.local", override: true}); // Load .env.local and override settings from .env

const s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
});

module.exports = s3;