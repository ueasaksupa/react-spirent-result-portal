const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestcaseSchema = new Schema(
    {
        label: String,
    },
    { timestamps: true, versionKey: false },
);

module.exports = TestcaseSchema;
