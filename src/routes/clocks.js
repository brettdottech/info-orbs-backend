const express = require("express");
const {
    getClocks,
    getClock,
    addClock,
    deleteClock,
    increaseDownloadCounterClock
} = require("../controllers/clockController");
const auth = require("../middleware/auth");
const router = express.Router();

// Allow auth and non-auth
router.get("/", (req, res, next) => {
    if (req.headers.authorization) {
        console.log("clocks get auth");
        auth(req, res, () => getClocks(req, res, next));
    } else {
        console.log("clocks get NO auth");
        getClocks(req, res, next);
    }
});

// Allow auth and non-auth
router.get("/:id", (req, res, next) => {
    if (req.headers.authorization) {
        console.log("clock get auth");
        auth(req, res, () => getClock(req, res, next));
    } else {
        console.log("clock get NO auth");
        getClock(req, res, next);
    }
});

// Only auth
router.post("/", auth, addClock);
// Only auth
router.delete("/:id", auth, deleteClock);
// Only non-auth
router.post("/:id/dl", increaseDownloadCounterClock);

module.exports = router;