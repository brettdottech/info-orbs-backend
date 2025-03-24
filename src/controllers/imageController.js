const {streamFileToResponse} = require("../storage/storage");

exports.streamFile = async (req, res) => {
    // console.log(req.params, process.env.STORAGE_BACKEND);
    const fileName = req.params[0];
    await streamFileToResponse(fileName, res);
};

