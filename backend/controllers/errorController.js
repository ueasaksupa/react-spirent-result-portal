const logger = require("../libs/logger");

module.exports.errorController = (err, req, res, next) => {
    // handle mongo error
    if (process.env.MODE === "dev") {
        logger.error(err.stack);
    } else {
        logger.error(err.message);
    }

    if (err.name && err.name === "MongoServerError") {
        // mongo error
        if (err.code === 11000) {
            // duplicate key error
            let keyVal = Object.keys(err.keyValue).filter((e) => e !== "owner" && e !== "project");
            res.status(400).json({ message: `Duplicate value in field [${keyVal.join(",")}]. Please try another value.` });
        }
    } else if (err.name && err.name === "CastError") {
        // cast error
        res.status(400).json({ message: `${err.reason ? err.reason.message : err.message}` });
    } else if (err.name && err.name === "ValidationError") {
        res.status(400).json({ message: err.message });
    } else if (err.name && err.name === "CONP login error") {
        res.status(400).json({ message: err.message });
    } else if (err.response) {
        res.status(err.response.status).json({ message: err.response.data.message });
    } else {
        // other error
        err.statusCode = err.statusCode || 500;
        res.status(err.statusCode).json({ message: err.message });
    }
};
