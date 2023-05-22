const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TemplateSchema = new Schema(
    {
        name: String,
        fps: Number,
    },
    { timestamps: true, versionKey: false },
);

module.exports = TemplateSchema;
