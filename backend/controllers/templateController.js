const XLSX = require("xlsx");
const { AppError, catchErrorAsync } = require("../libs/error");
const { TemplateModel } = require("../models/Model");

module.exports.getTemplateHandler = catchErrorAsync(async (req, res, next) => {
    let resp = await TemplateModel.find({});
    res.status(200).json(resp);
});

module.exports.putTemplateHandler = catchErrorAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError("file is required", 400));

    let workbook = XLSX.read(req.file.buffer);
    let worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let wbJson = XLSX.utils.sheet_to_json(worksheet);
    let dbData = wbJson.map((row) => ({ name: row["Stream Block"], fps: row.fps }));
    await TemplateModel.deleteMany({});
    await TemplateModel.insertMany(dbData);
    res.status(200).json(dbData);
});
