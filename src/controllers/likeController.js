const {Like} = require("../models/relations");

exports.getLike = async (req, res) => {
    // console.log(req);
    try {
        const like = await Like.count({where: {clockId: req.params.clockId, userId: req.user.id}});
        // console.log(like);
        res.json(like); // 0 or 1
    } catch (err) {
        res.status(400).json({error: err.message});
    }
};

exports.setLike = async (req, res) => {
    try {
        await Like.create({clockId: req.params.clockId, userId: req.user.id});
        res.json({msg: "Like added"});
    } catch (err) {
        res.status(400).json({error: err.message});
    }
};

exports.removeLike = async (req, res) => {
    try {
        await Like.destroy({where: {clockId: req.params.clockId, userId: req.user.id}});
        res.json({msg: "Like removed"});
    } catch (err) {
        res.status(400).json({error: err.message});
    }
};