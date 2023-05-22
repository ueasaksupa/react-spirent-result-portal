const { AppError, catchErrorAsync } = require("../libs/error");
const { ResultModel, TemplateModel } = require("../models/Model");
const XLSX = require("xlsx");

function readExcelSheetToJSON(buffer) {
    let workbook = XLSX.read(buffer);
    let worksheet = workbook.Sheets["Advanced Sequencing"];
    if (!worksheet) throw new AppError("no sheet name `Advanced Sequencing`");

    let wbJson = XLSX.utils.sheet_to_json(worksheet, { blankrows: false, range: 3 });
    return wbJson;
}

function generateDocPayload(excelData, filename, fpsIndex) {
    let pl = [];
    for (let row of excelData) {
        let streamname = row["Stream Block"].trim();
        let fps;
        if (!fpsIndex[streamname]) fps = -1;
        else fps = fpsIndex[streamname];
        pl.push({
            name: streamname,
            tx: row["Tx Count (Frames)"],
            rx: row["Rx Count (Frames)"],
            diff: row["Tx-Rx (Frames)"],
            dropcount: row["Dropped Frame Count"],
            fps: fps,
            droptime_ms: fps < 0 ? -1 : (row["Dropped Frame Count"] / fps) * 1000,
        });
    }
    return { filename, results: pl };
}

module.exports.getResultsHandler = catchErrorAsync(async (req, res, next) => {
    let resp = await ResultModel.find({}).select("-docs.results").sort("-testId");
    res.status(200).json(resp);
});

module.exports.getLatestResultsHandler = catchErrorAsync(async (req, res, next) => {
    let resp = await ResultModel.findOne({}).sort("-testId");
    res.status(200).json(resp);
});

module.exports.getResultHandler = catchErrorAsync(async (req, res, next) => {
    let testId = req.params.testId;

    let resp = await ResultModel.findOne({ testId: testId });
    if (!resp) return next(new AppError(`result ${testId} not found`, 404));

    res.status(200).json(resp);
});

module.exports.postResultHandler = catchErrorAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError("file is required", 400));
    if (!req.body.testId) return next(new AppError("testId is required", 400));
    if (!req.body.testcase) return next(new AppError("testcase is required", 400));

    let testresult = await ResultModel.findOne({ testId: req.body.testId });
    let fpsList = await TemplateModel.find({});
    let fpsIndex = {};

    for (let fps of fpsList) {
        fpsIndex[fps.name.trim()] = fps.fps;
    }

    let excelData = readExcelSheetToJSON(req.file.buffer);
    let docPayload = generateDocPayload(excelData, req.file.originalname, fpsIndex);

    if (testresult) {
        if (testresult.docs.some((doc) => doc.filename === req.file.originalname))
            return next(
                new AppError(`file ${req.file.originalname} is already uploaded, please remove previous result and re-upload.`),
                400,
            );
        testresult.docs.push(docPayload);
        await testresult.save();
        return res.status(200).json(testresult);
    } else {
        let resp = await ResultModel.create({ testId: req.body.testId, testcase: req.body.testcase, docs: [docPayload] });
        return res.status(200).json(resp);
    }
});

module.exports.deleteResultHandler = catchErrorAsync(async (req, res, next) => {
    let testId = req.params.testId;
    let resp = await ResultModel.findOneAndDelete({ testId: testId });
    if (!resp) return next(new AppError(`result ${testId} not found`, 404));

    res.status(204).end();
});

module.exports.deleteResultSubDocHandler = catchErrorAsync(async (req, res, next) => {
    let testId = req.params.testId;
    let docId = req.params.docId;
    let testresult = await ResultModel.findOneAndUpdate({ testId: testId }, { $pull: { docs: { _id: docId } } }, { new: true });
    res.status(200).json(testresult);
});

module.exports.patchResultRemarkHandler = catchErrorAsync(async (req, res, next) => {
    let testId = req.params.testId;
    let testresult = await ResultModel.findOneAndUpdate({ testId: testId }, { remark: req.body.remark }, { new: true });
    res.status(200).json(testresult);
});
