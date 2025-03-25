const express = require("express");
const {getLike, setLike, removeLike} = require("../controllers/likeController");
const {auth} = require("../middleware/auth");
const router = express.Router();

router.get("/:clockId", auth, getLike);
router.post("/:clockId", auth, setLike);
router.delete("/:clockId", auth, removeLike);

module.exports = router;