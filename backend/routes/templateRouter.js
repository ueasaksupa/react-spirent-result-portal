const express = require("express");
const multer = require("multer");

const templateController = require("../controllers/templateController");

const router = express.Router();
const upload = multer();

// route GET,POST /
router.route("/").get(templateController.getTemplateHandler).put(upload.single("file"), templateController.putTemplateHandler);

module.exports = router;
