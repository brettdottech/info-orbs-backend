const {Clock} = require("../models/relations");
const {saveFileToStorage} = require("../storage/storage");

exports.uploadImages = async (req, res) => {
    // Check if files are provided
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({error: "No files uploaded"});
    }
    const clockId = req.body.id;
    if (!clockId) {
        return res.status(400).json({error: "No clock id provided"});
    }
    const clock = await Clock.findByPk(clockId)
    if (!clock || clock.userId !== req.user.id) {
        return res.status(400).json({error: `Invalid clock id ${clockId}`});
    }

    try {
        for (const file of req.files) {
            const fileBuffer = file.buffer;
            const fileName = `${clockId}/${file.originalname}`;

            await saveFileToStorage(fileName, fileBuffer);
        }
        res.json({message: "Upload successful"});
    } catch (error) {
        res.status(500).json({error: "Upload failed"});
    }
};