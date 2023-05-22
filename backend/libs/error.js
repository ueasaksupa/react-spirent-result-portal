const logger = require("./logger");

class AppError extends Error {
    constructor(message, status = 500, name = "AppError") {
        super(message);
        this.name = name;
        this.statusCode = status;
    }
}

module.exports.AppError = AppError;

module.exports.catchErrorAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
