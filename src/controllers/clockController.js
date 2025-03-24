const {Sequelize} = require("sequelize");
const {Clock, Like} = require("../models/relations");

// A simple in-memory download tracker to avoid incrementing the clock download counter more
// than once per day per IP
const downloadTracker = new Map(); // { key: { clocks: Set<clockIds>, timestamp: number } }
const DOWNLOADTRACKER_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of downloadTracker.entries()) {
        if (now - entry.timestamp > DOWNLOADTRACKER_CLEANUP_INTERVAL_MS) {
            downloadTracker.delete(key);
        }
    }
}, 60 * 60 * 1000); // Run cleanup every hour

exports.getClocks = async (req, res) => {
    // console.log(req);
    try {
        const clocks = await Clock.findAll({
            attributes: {
                include: [
                    [
                        Sequelize.cast(
                            Sequelize.fn(
                                "COUNT", Sequelize.col("Likes.id")),
                            'INTEGER'),// Count the likes for each clock
                        "likes", // Name of the computed field
                    ],
                ],
            },
            include: [
                {
                    model: Like,
                    attributes: [],
                }],
            group: ["Clock.id", "Clock.userId"], // Group by Clock ID and User ID to avoid duplicate results
            raw: true,
        });

        console.log(clocks);
        if (req.user && req.user.id) {
            const likes = await Like.findAll({
                where: {
                    userId: req.user.id,
                }
            });

            // Convert the likes array to a Set for faster lookups
            const likedClockIds = new Set(likes.map(like => like.clockId));

            // console.log(likedClockIds);

            // Map through the clocks and add `userLiked` property
            const enrichedClocks = clocks.map(clock => {
                clock.userLiked = likedClockIds.has(clock.id) ? 1 : 0;
                // console.log(clockData);
                return clock;
            });

            res.json(enrichedClocks);
        } else {
            res.json(clocks);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
};

exports.getClock = async (req, res) => {
    try {
        const clock = await Clock.findByPk(req.params.id, {
            attributes: {
                include: [
                    [
                        Sequelize.cast(
                            Sequelize.fn(
                                "COUNT", Sequelize.col("Likes.id")),
                            'INTEGER'),// Count the likes for each clock
                        "likes", // Name of the computed field
                    ],
                ],
            },
            include: [
                {
                    model: Like,
                    attributes: [],
                }],
            group: ["Clock.id", "Clock.userId"], // Group by Clock ID and User ID to avoid duplicate results
            raw: true,
        });
        // console.log(req.user, req.user?.id);
        if (req.user && req.user.id) {
            const userLiked = await Like.count({
                where: {
                    userId: req.user.id,
                    clockId: req.params.id,
                }
            });
            // console.log(userLiked);

            clock.userLiked = userLiked > 0;
        }
        // console.log(clock);
        res.json(clock);
    } catch (err) {
        res.status(500).json({error: err});
    }
};

exports.addClock = async (req, res) => {
    console.log(req.body);
    const {name, url, author, description, secondHandColor} = req.body;
    try {
        const clock = await Clock.create({name, url, author, description, secondHandColor, userId: req.user.id});
        res.json(clock);
    } catch (err) {
        res.status(400).json({error: err});
    }
};

exports.deleteClock = async (req, res) => {
    try {
        const clock = await Clock.findByPk(req.params.id);
        if (!clock || (clock.userId !== req.user.id)) { //} && !req.user.is_admin)) {
            return res.status(403).json({msg: "Not authorized"});
        }
        await clock.destroy();
        res.json({msg: "Clock deleted"});
    } catch (err) {
        res.status(500).json({error: err});
    }
};


exports.updateClock = async (req, res) => {
    const clockId = req.params.id;
    const {name, jpg_url, description} = req.body;

    try {
        const clock = await Clock.findByPk(clockId);

        if (!clock) {
            return res.status(404).json({msg: "Clock not found"});
        }

        if (clock.userId !== req.user.id && !req.user.is_admin) {
            return res.status(403).json({msg: "Not authorized"});
        }

        clock.name = name || clock.name;
        clock.jpg_url = jpg_url || clock.jpg_url;
        clock.description = description || clock.description;

        await clock.save();

        res.json(clock);
    } catch (err) {
        res.status(500).json({error: err});
    }
};

// TODO fix potential race condition by using a Mutex/Lock
exports.increaseDownloadCounterClock = async (req, res) => {
    try {
        const clockId = req.params.id;
        const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        if (!ip) {
            // return res.status(400).json({ error: "Could not determine IP address." });
            return res.status(400).json({error: "Could not determine IP address"});
        }

        const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
        const key = `${ip}_${today}`;

        if (!downloadTracker.has(key)) {
            downloadTracker.set(key, {clocks: new Set(), timestamp: Date.now()});
        }

        const entry = downloadTracker.get(key);
        if (entry.clocks.has(clockId)) {
            // return res.status(429).json({ error: "Download limit reached for today." });
            return res.status(400).json({error: "Duplicate - ignored"});
        }

        entry.clocks.add(clockId);

        // Increase the download counter
        await Clock.increment(
            'downloads',
            {by: 1, where: {id: clockId}}
        );

        const clockAfterUpdate = await Clock.findByPk(clockId);
        if (clockAfterUpdate) {
            return res.json({status: "OK", downloads: clockAfterUpdate.downloads});
        } else {
            return res.status(400).json({error: "Clock not found"});
        }
    } catch (err) {
        return res.status(500).json({error: err});
    }
};
