const util = require("util");
class Logger {
    constructor() {}
    info(...args) {
        let date = new Date().toISOString();
        console.log(`[info][${date}] - ${args.join(" ")}`);
    }
    error(...args) {
        let date = new Date().toISOString();
        console.log(`[Error][${date}] - ${args.join(" ")}`);
    }
    debug(...args) {
        if (!process.argv.slice(3, process.argv.length).includes("--debug")) return;
        let argString = args.map((el) => (typeof el === "object" ? util.inspect(el, false, 2, true) : el));
        let date = new Date().toISOString();
        console.log(`[debug][${date}] - ${argString.join(" ")}`);
    }
    emit(...args) {
        const io = getio();
        if (io) {
            io.sockets.emit("buildMsg", args.join(" "));
        }
    }
}

module.exports = new Logger();
