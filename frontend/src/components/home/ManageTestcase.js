import React, { useState, useEffect, useRef } from "react";
import backend from "../api/backend";

const ManageTestcase = ({ testcase, fetchAllTestcase }) => {
    const [focusRow, setFocusRow] = useState(null);
    const [showNewInputBox, setShowNewInputBox] = useState(false);
    const [inputTestcaseLabel, setInputTestcaseLabel] = useState("");

    const onCreateNewTestcase = async () => {
        try {
            await backend.post("/testcase", { label: inputTestcaseLabel });
            setInputTestcaseLabel("");
            setShowNewInputBox(false);
            fetchAllTestcase();
        } catch (error) {
            console.log(error);
        }
    };

    const onDeleteTestcase = async (id) => {
        try {
            await backend.delete(`/testcase/${id}`);
            fetchAllTestcase();
        } catch (error) {
            console.log(error);
        }
    };

    const renderTestcase = () => {
        return testcase.map((t, i) => {
            return (
                <li
                    key={i}
                    className={`d-flex list-group-item list-group-item ${focusRow === i ? "active" : ""}`}
                    onMouseEnter={() => {
                        setFocusRow(i);
                    }}
                    onMouseLeave={() => {
                        setFocusRow(null);
                    }}
                >
                    <span className="me-auto">{t.label}</span>
                    {focusRow === i ? (
                        <span role="button" onClick={() => onDeleteTestcase(t._id)}>
                            <i title="delete" className="fas fa-trash-alt" />
                        </span>
                    ) : null}
                </li>
            );
        });
    };

    return (
        <div>
            <div className="row mb-3">
                <div className="col-2">
                    <span role="button" onClick={() => setShowNewInputBox(true)}>
                        <i title="edit" className="fas fa-plus" /> New
                    </span>
                </div>
                {showNewInputBox ? (
                    <div className="col-10">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text">Label</span>
                            <input
                                type="text"
                                className="form-control"
                                value={inputTestcaseLabel}
                                onChange={(e) => setInputTestcaseLabel(e.target.value)}
                            />
                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => {
                                    setShowNewInputBox(false);
                                    setInputTestcaseLabel("");
                                }}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-warning" type="button" onClick={onCreateNewTestcase}>
                                Create
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
            {testcase.length === 0 ? (
                <div>No testcase to show, please create it before using.</div>
            ) : (
                <ul className="list-group">{renderTestcase()}</ul>
            )}
        </div>
    );
};

export default ManageTestcase;
