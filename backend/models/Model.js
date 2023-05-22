const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const TemplateSchema = require("./TemplateSchema");
const ResultSchema = require("./ResultSchema");
const TestcaseSchema = require("./TestcaseSchema");

let TemplateModel = mongoose.model("Template", TemplateSchema);
let ResultModel = mongoose.model("Result", ResultSchema);
let TestcaseModel = mongoose.model("Testcase", TestcaseSchema);

module.exports.TemplateModel = TemplateModel;
module.exports.ResultModel = ResultModel;
module.exports.TestcaseModel = TestcaseModel;
