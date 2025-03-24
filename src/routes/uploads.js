const express = require("express");
const {uploadImages} = require("../controllers/uploadController");
const auth = require("../middleware/auth");
const multer = require("multer");

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});


router.post("/", auth, upload.array('files'), uploadImages);

// Get signed URL for a private image
// router.get("/:fileName", getSignedUrl);

module.exports = router;
