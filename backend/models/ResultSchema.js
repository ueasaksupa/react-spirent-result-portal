const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DocumentSchema = new Schema(
    {
        filename: String,
        results: [{ name: String, tx: Number, rx: Number, diff: Number, dropcount: Number, fps: Number, droptime_ms: Number }],
    },
    { timestamps: true, versionKey: false },
);

const ResultSchema = new Schema(
    {
        testId: { type: Number, min: 1, required: true },
        testcase: String,
        remark: String,
        docs: [DocumentSchema],
    },
    { timestamps: true, versionKey: false },
);

module.exports = ResultSchema;
