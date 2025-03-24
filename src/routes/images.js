const express = require("express");
const rateLimit = require("express-rate-limit");
const {streamFile} = require("../controllers/imageController");

const router = express.Router();

// Create a rate limiter for 500 requests per minute per IP
const perMinuteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 500, // limit each IP to 500 requests per window
    message: "Too many requests from this IP, please try again after a minute.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Create a rate limiter for 10,000 requests per day per IP
const perDayLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10000, // limit each IP to 10,000 requests per day
    message: "Too many requests from this IP, please try again after a day.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply both limiters to all requests to '/images'
router.use(perMinuteLimiter); // First rate limiter for per-minute limit
router.use(perDayLimiter); // Second rate limiter for per-day limit

// Stream a file directly from R2
router.get("/*", streamFile);

module.exports = router;