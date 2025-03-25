require("dotenv").config(); // Load .env file
require("dotenv").config({path: ".env.local", override: true}); // Load .env.local and override settings from .env

const axios = require("axios");
const {jwtVerify} = require("@kinde-oss/kinde-node-express");
const jwt = require('jsonwebtoken');

// In-memory token cache
let cachedToken = null;
let cachedTokenExpiresAt = null;
// To handle race condition for M2M token requests
let tokenRequestInProgress = null;

let userDetailsCache = {};
let lastCacheUpdatedAt = null;
const CACHE_REFRESH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

const authenticate = jwtVerify(process.env.KINDE_DOMAIN, {});

// Helper: Fetch M2M token with locking to avoid race conditions
const getM2MToken = async () => {
    // If token is valid (not expired), use it
    if (cachedToken && cachedTokenExpiresAt > Date.now()) {
        console.log("Using cached M2M token");
        return cachedToken;
    }

    // If a token request is already in progress, wait for it
    if (tokenRequestInProgress) {
        console.log("Waiting for in-progress M2M token request...");
        return tokenRequestInProgress;
    }

    // Initialize the token request
    console.log("Requesting new M2M token...");
    tokenRequestInProgress = new Promise(async (resolve, reject) => {
        try {
            const params = {
                client_id: process.env.KINDE_CLIENT_ID,
                client_secret: process.env.KINDE_CLIENT_SECRET,
                grant_type: "client_credentials",
                audience: `${process.env.KINDE_DOMAIN}/api`
            };
            const response = await axios.post(
                `${process.env.KINDE_DOMAIN}/oauth2/token`,
                new URLSearchParams(params).toString(),
                {headers: {"Content-Type": "application/x-www-form-urlencoded"}}
            );

            // Store the new token and expiration time
            cachedToken = response.data.access_token;
            cachedTokenExpiresAt = Date.now() + response.data.expires_in * 1000; // Expires in seconds

            console.log("New M2M token fetched!");
            resolve(cachedToken);
        } catch (err) {
            console.error("Error fetching M2M token:", err.response?.data || err.message);
            reject(new Error("Failed to fetch M2M token."));
        } finally {
            // Reset the token request to avoid blocking future calls
            tokenRequestInProgress = null;
        }
    });

    return tokenRequestInProgress;
};

// Helper: Preload all user details and cache them
const preloadUserDetails = async () => {
    try {
        console.log("Preloading user details...");
        const url = `${process.env.KINDE_DOMAIN}/api/v1/users`;
        const token = await getM2MToken();
        const response = await axios.get(url, {
            headers: {Authorization: `Bearer ${token}`}
        });

        // Update the in-memory cache
        userDetailsCache = response.data.users.reduce((acc, user) => {
            acc[user.id] = {
                name: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
                shortname: `${user.first_name || ""} ${user.last_name ? user.last_name.substring(0, 1) + "." : ""}`.trim(),
                email: user.email,
            };
            return acc;
        }, {});

        lastCacheUpdatedAt = Date.now();

        console.log("User details preloaded:", Object.keys(userDetailsCache).length);
        // console.log(userDetailsCache);
    } catch (err) {
        console.error("Error preloading user details:", err.response?.data || err.message);
    }
};

// Helper: Fetch and cache a single user's details if missing
const fetchAndCacheUser = async (id) => {
    try {
        console.log(`Fetching details for missing user: ${id}`);
        const url = `${process.env.KINDE_DOMAIN}/api/v1/user?id=${id}`;
        const token = await getM2MToken();
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Add the fetched user to the cache
        const user = response.data;
        userDetailsCache[user.id] = {
            email: user.email,
            name: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            shortname: `${user.first_name || ""} ${user.last_name ? user.last_name.substring(0, 1) + "." : ""}`.trim(),
        };

        console.log(`User ${id} added to cache.`);
        return userDetailsCache[user.id];
    } catch (err) {
        console.error(`Error fetching user ${id}:`, err.response?.data || err.message);
        throw new Error(`Failed to fetch user ${id}.`);
    }
};

const extractTokenInfo = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'No token provided'});
    }

    const token = authHeader.split(' ')[1];

    try {
        // Decode token without verifying (since jwtVerify already verified it)
        const decoded = jwt.decode(token);

        console.log("Decoded JWT", decoded);

        // Extract relevant fields
        req.decodedToken = decoded;

        next();
    } catch (error) {
        return res.status(401).json({error: 'Invalid token'});
    }
};


exports.auth = async (req, res, next) => {
    try {
        // Step 1: Authenticate the user
        await authenticate(req, res, async () => {
            // Step 2: Extract token information if authentication is successful
            extractTokenInfo(req, res, next);
        });
        // console.log(req.decodedToken);
    } catch (err) {
        console.error("Error in authentication or token extraction:", err.message);
        return res.status(401).json({error: "Authentication or token extraction failed."});
    }
};

exports.hasRole = (req, role) => {
    return (req.decodedToken?.roles?.some(r => r.key === role));
}

exports.getUserNameById = async (id, short = false) => {
    if (userDetailsCache[id]) {
        if (short) {
            return userDetailsCache[id]?.shortname || "Unknown User";
        } else {
            return userDetailsCache[id]?.name || "Unknown User";
        }
    } else {
        const user = await fetchAndCacheUser(id);
        if (short) {
            return user?.shortname || "Unknown User";
        } else {
            return user?.name || "Unknown User";
        }
    }
}

// Periodically refresh the cache in the background
setInterval(async () => {
    const now = Date.now();
    if (!lastCacheUpdatedAt || now - lastCacheUpdatedAt > CACHE_REFRESH_INTERVAL) {
        console.log("Refreshing user cache...");
        await preloadUserDetails();
    }
}, CACHE_REFRESH_INTERVAL);

// Preload user details on app startup
preloadUserDetails();
