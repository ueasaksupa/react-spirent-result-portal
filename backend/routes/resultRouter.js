const express = require("express");
const multer = require("multer");

const resultController = require("../controllers/resultController");
const { handle404Error } = require("../controllers/errorController");

const router = express.Router();
const upload = multer();

// route GET,POST /
router.route("/").get(resultController.getResultsHandler).post(upload.single("file"), resultController.postResultHandler);
router.route("/latest").get(resultController.getLatestResultsHandler);
router.route("/:testId").get(resultController.getResultHandler).delete(resultController.deleteResultHandler);
router.route("/:testId/doc/:docId").delete(resultController.deleteResultSubDocHandler);
router.route("/:testId/remark").patch(resultController.patchResultRemarkHandler);

module.exports = router;
