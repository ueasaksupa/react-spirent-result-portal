const XLSX = require("xlsx");
const { AppError, catchErrorAsync } = require("../libs/error");
const { TestcaseModel } = require("../models/Model");

module.exports.getTestcaseHandler = catchErrorAsync(async (req, res, next) => {
    let resp = await TestcaseModel.find({}).sort("label");
    res.status(200).json(resp);
});

module.exports.postTestcaseHandler = catchErrorAsync(async (req, res, next) => {
    let resp = await TestcaseModel.create({ ...req.body });
    res.status(201).json(resp);
});

module.exports.deleteTestcaseHandler = catchErrorAsync(async (req, res, next) => {
    let id = req.params.id;
    let resp = await TestcaseModel.findOneAndDelete({ _id: id });
    if (!resp) return next(new AppError("testcase not found", 404));

    res.status(204).end();
});

module.exports.patchTestcaseHandler = catchErrorAsync(async (req, res, next) => {
    let id = req.params.id;
    let resp = await TestcaseModel.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });
    if (!resp) return next(new AppError("testcase not found", 404));

    res.status(200).json(resp);
});
