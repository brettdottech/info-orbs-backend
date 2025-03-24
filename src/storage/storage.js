const {GetObjectCommand, PutObjectCommand} = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const fs = require("fs");
const path = require("path");
const s3 = require("../config/s3");

const streamFileToResponse = async (fileName, res) => {
    console.log("Streaming file", fileName, process.env.STORAGE_BACKEND);
    try {
        if (process.env.STORAGE_BACKEND === "dir") {
            const filePath = path.join(process.env.STORAGE_DIR, fileName);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(err);
                    return res.status(404).json({error: "File not found"});
                }

                const contentType = mime.lookup(filePath);
                res.setHeader("Content-Type", contentType || "application/octet-stream");
                res.setHeader("Content-Length", stats.size);

                const readStream = fs.createReadStream(filePath);
                readStream.on("error", (error) => {
                    console.error(error);
                    res.status(500).json({error: "File streaming error"});
                });

                readStream.pipe(res);
            });
        } else if (process.env.STORAGE_BACKEND === "s3") {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
            });

            const file = await s3.send(command);

            res.setHeader("Content-Type", file.ContentType);
            res.setHeader("Content-Length", file.ContentLength);
            file.Body.pipe(res);
        } else {
            res.status(500).json({error: "Storage backend not configured"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "File retrieval failed"});
    }
}

const saveFileToStorage = async (fileName, fileBuffer) => {
    console.log("Saving file", fileName, process.env.STORAGE_BACKEND);
    if (process.env.STORAGE_BACKEND === "dir") {
        const filePath = path.join(process.env.STORAGE_DIR, fileName);

        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {recursive: true});
        }

        fs.writeFile(filePath, fileBuffer, (err) => {
            if (err) {
                console.error(err);
                throw new Error("Failed to save file to local storage");
            }
            console.log("File successfully saved to local storage:", filePath);
        });
    } else if (process.env.STORAGE_BACKEND === "s3") {
        // Upload each file to S3
        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: file.mimetype,
            })
        );
    }
}

module.exports = {
    streamFileToResponse,
    saveFileToStorage
}