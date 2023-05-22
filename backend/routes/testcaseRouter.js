const express = require("express");
const multer = require("multer");

const testcaseController = require("../controllers/testcaseController");

const router = express.Router();

// route GET,POST /
router.route("/").get(testcaseController.getTestcaseHandler).post(testcaseController.postTestcaseHandler);
router.route("/:id").delete(testcaseController.deleteTestcaseHandler).patch(testcaseController.patchTestcaseHandler);

module.exports = router;
