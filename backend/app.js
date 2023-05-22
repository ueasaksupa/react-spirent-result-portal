// Load ENV
if (process.argv.slice(2)[0] === "dev") {
    require("dotenv").config({ path: "./.env.dev" });
} else {
    require("dotenv").config();
}
// External Lib
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

// Router and RouteController
const resultRouter = require("./routes/resultRouter");
const templateRouter = require("./routes/templateRouter");
const testcaseRouter = require("./routes/testcaseRouter");

// Helper Lib
const { errorController } = require("./controllers/errorController");
const logger = require("./libs/logger");

const MODE = {
    dev: "dev",
    prod: "production",
};

// MongoDB connection option
const MongoDBconnectionOption = {
    user: process.env.MODE === MODE.dev ? "" : process.env.MONGO_USER,
    pass: process.env.MODE === MODE.dev ? "" : process.env.MONGO_PASS,
    authSource: process.env.MODE === MODE.prod ? "admin" : undefined,
    autoIndex: true,
};

//
const CORS_OPTION = {
    credentials: true,
    origin: process.env.MODE === MODE.dev ? ["http://localhost:3000", "http://127.0.0.1:3000"] : process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200,
};

//
const app = express();
// DEFINE MIDDLEWARES
app.use(cookieParser());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use(express.text());
app.use(cors(CORS_OPTION));

app.use(
    morgan(function (tokens, req, res) {
        return [
            `[info][${new Date().toISOString()}]`,
            `- ${tokens.method(req, res)} -`,
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, "content-length"),
            "-",
            tokens["response-time"](req, res),
            "ms",
            "--",
            req.user ? req.user.email : "",
        ].join(" ");
    }),
);

// DEFINE ROUTES
app.use("/api/result", resultRouter);
app.use("/api/template", templateRouter);
app.use("/api/testcase", testcaseRouter);

// default 404 invalid route
app.route("*").all((req, res) => {
    res.status(404).json({ message: "invalid endpoint." });
});
// Global Error Handling
app.use(errorController);

// SERVER
let Server;
Server = http.createServer(app); //nginx take care of ssl terminaion so, backend run at http only

// START SERVER !!
let MONGO_CONN_URL = `mongodb://${process.env.MONGO_HOST}/resultPortalDB${
    process.env.MONGO_REPLICAS ? "?replicaSet=db-replicas" : ""
}`;
logger.info(`Connecting to ${MONGO_CONN_URL}`);
mongoose.connect(MONGO_CONN_URL, MongoDBconnectionOption).catch((error) => console.log(error));
mongoose.Promise = global.Promise;
mongoose.connection
    .once("open", () => {
        logger.info("Connected to MongoDB on", MONGO_CONN_URL);
        let port = process.env.SERVER_PORT || 5001;
        const expressServer = Server.listen(port, () => {
            logger.info(
                `listening on ${process.env.MODE === MODE.prod ? `${process.env.CORS_ORIGIN}/api` : `http//localhost:${port}`}`,
            );
        });
    })
    .on("error", (error) => logger.info("ERROR - Error connecting to MongoLab:", error));
