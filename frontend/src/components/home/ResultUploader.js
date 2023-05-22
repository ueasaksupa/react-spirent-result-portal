import React, { useState, useEffect } from "react";
import backend from "../api/backend";
import { useNavigate } from "react-router-dom";
import ManageTestcase from "./ManageTestcase";

const ResultUploder = () => {
    const [testcase, setTestcase] = useState([]);
    const [inputParams, setInputParams] = useState({ testId: 1, testcase: "select testcase" });
    const [uploadSelector, setUploadSelector] = useState("result");
    const navigate = useNavigate();

    const renderSelectTestcase = () => {
        if (testcase.length === 0) {
            return <option value="0">Please add testcase before using</option>;
        } else {
            let optionJsx = [<option key={0}>select testcase</option>];
            optionJsx.push(
                testcase.map((e, i) => {
                    return (
                        <option key={e._id} value={e.label}>
                            {e.label}
                        </option>
                    );
                }),
            );
            return optionJsx;
        }
    };

    const onInputChangeHandler = (event) => {
        const type = event.target.type;
        const name = event.target.name;
        const value = event.target.value;
        if (!value || value <= 0) return;
        // automatic change selectbox base on input test-number
        if (name === "testId") {
            backend
                .get(`/result/${value}`)
                .then((response) => {
                    if (response.status === 200) {
                        setInputParams({ testcase: response.data.testcase, testId: value });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        setInputParams({
            ...inputParams,
            [name]: type === "checkbox" ? event.target.checked : value,
        });
    };

    const onFormResultSubmitHandler = (e) => {
        e.preventDefault();
        if (testcase.length === 0) {
            alert("please add testcase first");
            return;
        }
        let formData = new FormData();
        let file = document.querySelector("#file");

        formData.append("file", file.files[0]);
        formData.append("testId", inputParams.testId);
        formData.append("testcase", inputParams.testcase);
        backend
            .post("/result", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
                navigate(`/result/${inputParams.testId}`);
            })
            .catch((err) => {
                if (err.response) alert(err.response.data.message);
            });
    };

    const onFormTemplateSubmitHandler = (e) => {
        e.preventDefault();

        let formData = new FormData();
        let file = document.querySelector("#file");

        formData.append("file", file.files[0]);
        backend
            .put("/template", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                navigate("/template");
            });
    };

    const fetchAllTestcase = async () => {
        try {
            const response = await backend.get("/testcase");
            console.log("testcase:: ", response.data);
            setTestcase(response.data);
        } catch (error) {
            console.log(error);
            setTestcase([]);
        }
    };

    const fetchLatestResult = async () => {
        try {
            const response = await backend.get("/result/latest");
            setInputParams({ testcase: response.data.testcase, testId: response.data.testId });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        document.title = "portal :: Upload";
        fetchAllTestcase();
        fetchLatestResult();
    }, []);

    let formBody;
    if (uploadSelector === "result") {
        formBody = (
            <div className="cover-container d-flex h-100 p-3 mx-auto flex-column">
                <form encType="multipart/form-data" onSubmit={onFormResultSubmitHandler}>
                    <div className="form-group row my-2">
                        <label className="col-sm-2 col-form-label">Test ID</label>
                        <div className="col-sm-10">
                            <input
                                type="number"
                                className="form-control"
                                name="testId"
                                min={1}
                                onChange={onInputChangeHandler}
                                value={inputParams.testId}
                            />
                        </div>
                    </div>
                    <div className="form-group row my-2">
                        <label className="col-sm-2 col-form-label">Testcase</label>
                        <div className="col-sm-10">
                            <select
                                type="select"
                                className="form-control"
                                name="testcase"
                                onChange={onInputChangeHandler}
                                value={inputParams.testcase}
                            >
                                {renderSelectTestcase()}
                            </select>
                        </div>
                    </div>
                    <div className="form-group row my-4">
                        <label className="col-sm-2 col-form-label">Please select file (.xlsx)</label>
                        <div className="col-sm-10">
                            <input id="file" type="file" name="file" />
                            <button
                                disabled={inputParams.testcase === "select testcase"}
                                className={`btn btn-sm btn-success ${testcase.length === 0 ? "disabled" : ""}`}
                                type="submit"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    } else if (uploadSelector === "template") {
        formBody = (
            <div className="cover-container d-flex h-100 p-3 mx-auto flex-column">
                <form encType="multipart/form-data" onSubmit={onFormTemplateSubmitHandler}>
                    <div className="form-group row">
                        <label className="col-sm-2 col-form-label">Please select file (.xlsx)</label>
                        <div className="col-sm-10">
                            <input id="file" type="file" name="file" />
                            <button className="btn btn-success" type="submit">
                                Upload
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    } else if (uploadSelector === "testcase") {
        formBody = <ManageTestcase testcase={testcase} fetchAllTestcase={fetchAllTestcase} />;
    }

    return (
        <div className="uploder-container">
            <div className="mb-4 btn-group btn-group-lg">
                <button
                    type="button"
                    className={`btn btn-secondary ${uploadSelector === "result" ? "active" : null}`}
                    onClick={() => setUploadSelector("result")}
                >
                    Upload result
                </button>
                <button
                    type="button"
                    className={`btn btn-secondary ${uploadSelector === "template" ? "active" : null}`}
                    onClick={() => setUploadSelector("template")}
                >
                    Upload template
                </button>
                <button
                    type="button"
                    className={`btn btn-secondary ${uploadSelector === "testcase" ? "active" : null}`}
                    onClick={() => setUploadSelector("testcase")}
                >
                    Manage testcase
                </button>
            </div>
            {formBody}
        </div>
    );
};

export default ResultUploder;
