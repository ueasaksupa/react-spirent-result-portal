import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import backend from "../api/backend";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import DataTable, { createTheme } from "react-data-table-component";

const Home = () => {
    const staticResult = useRef();
    const [modalShow, setModalShow] = useState({ remark: false, delete: false });
    const [selectedRemark, setSelectedRemark] = useState("");
    const [selectedTestNumber, setSelectedTestNumber] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchResultData = async () => {
        let results;
        // get results
        console.log("preprocess data");
        try {
            const resultReps = await backend.get("/result");
            if (resultReps.status === 200) {
                console.log("results:: ", resultReps.data);
                results = resultReps.data;
            } else {
                setError(true);
            }
            // prepare data for data-table
            const tmp = results.map((row) => {
                return {
                    testId: parseInt(row.testId),
                    testcase: row.testcase,
                    file_upload: row.docs.map((el) => el.filename).join(","),
                    remark: row.remark,
                    createdAt: new Date(row.createdAt).toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
                };
            });
            staticResult.current = tmp;
            setData(tmp);
        } catch (error) {
            console.log(error);
            setError(true);
        }
    };
    //
    const onSearchChangeHandler = (e) => {
        console.log(e.target.value);
        const value = e.target.value;
        const tmp = [];
        console.log(staticResult.current);
        for (const row of staticResult.current) {
            for (const col in row) {
                if (typeof row[col] === "string" && row[col].toString().includes(value)) {
                    tmp.push(row);
                    break;
                }
            }
        }
        setData(tmp);
    };
    const handleDeleteTestSubject = async (test_number) => {
        await backend.delete(`/result/${test_number}`);
        fetchResultData();
        handleClose("delete");
    };
    const handleClose = (modalType) => {
        setModalShow({ ...modalShow, [modalType]: false });
    };
    const handleShow = (modalType) => {
        setModalShow({ ...modalShow, [modalType]: true });
    };
    const handleRemarkSubmit = () => {
        backend.patch(`/result/${selectedTestNumber}/remark`, { remark: selectedRemark }).then((response) => {
            handleClose("remark");
            fetchResultData();
        });
    };

    useEffect(() => {
        document.title = "portal :: All results";
        fetchResultData();
    }, []);

    /*
    data-table
    */
    createTheme("solarized", {
        text: {
            primary: "#f0ece3",
            secondary: "#fff",
        },
        background: {
            default: "#596e79",
        },
        context: {
            background: "#cb4b16",
            text: "#FFFFFF",
        },
        divider: {
            default: "#073642",
        },
        action: {
            button: "rgba(0,0,0,.54)",
            hover: "rgba(0,0,0,.08)",
            disabled: "rgba(0,0,0,.12)",
        },
    });
    const columns = [
        {
            name: "no.",
            selector: (row) => row.testId,
            sortable: true,
        },
        {
            name: "testcase",
            grow: 2,
            selector: (row) => row.testcase,
            sortable: true,
        },
        {
            name: "File uploaded",
            grow: 2,
            selector: (row) => row.file_upload,
            sortable: false,
        },
        {
            name: "Remark",
            grow: 2,
            cell: (row) => (
                <>
                    <div id={`remark-${row.testId}`}>{row.remark}</div>
                    <i
                        style={{ color: "#29a19c", padding: "0 10px" }}
                        type="button"
                        className="fas fa-edit action-icon"
                        onClick={() => {
                            setSelectedRemark(row.remark);
                            setSelectedTestNumber(row.testId);
                            handleShow("remark");
                        }}
                    ></i>
                </>
            ),
        },
        {
            name: "action",
            sortable: false,
            right: true,
            // ignoreRowClick: true,
            cell: (row) => (
                <div className="d-flex">
                    <i
                        style={{ color: "#e76f51", padding: "0 10px" }}
                        type="button"
                        className="fas fa-trash-alt action-icon"
                        onClick={() => {
                            setSelectedRemark(row.remark);
                            setSelectedTestNumber(row.testId);
                            handleShow("delete");
                        }}
                    ></i>
                </div>
            ),
        },
        {
            name: "Create on",
            selector: (row) => row.createdAt,
            sortable: true,
            right: true,
        },
    ];
    //
    // check if all data ready
    if (data) {
        return (
            <div className="container-fluid">
                <DataTable
                    title="All Results"
                    highlightOnHover
                    pointerOnHover
                    pagination
                    paginationPerPage={40}
                    paginationRowsPerPageOptions={[10, 40, 70, 100]}
                    defaultSortField="testId"
                    defaultSortAsc={false}
                    subHeader
                    subHeaderComponent={<input type="text" placeholder="search" onChange={onSearchChangeHandler} />}
                    dense
                    columns={columns}
                    data={data}
                    theme="solarized"
                    onRowClicked={(row) => navigate(`/result/${row.testId}`)}
                />
                <Modal show={modalShow.remark} onHide={() => handleClose("remark")}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit remark</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <input
                            type="text"
                            className="form-control"
                            value={selectedRemark || ""}
                            onChange={(e) => setSelectedRemark(e.target.value)}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => handleClose("remark")}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleRemarkSubmit}>
                            Save Change
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={modalShow.delete} onHide={() => handleClose("delete")}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete test {selectedTestNumber}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Button variant="secondary" className="mx-2" onClick={() => handleClose("delete")}>
                            Close
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteTestSubject(selectedTestNumber)}>
                            Delete
                        </Button>
                    </Modal.Body>
                </Modal>
            </div>
        );
    } else {
        if (error) {
            return (
                <div className="text-center">
                    Cannot connect to API backend please check with API service or refresh the page.
                </div>
            );
        } else {
            return <div className="text-center">Loading ...</div>;
        }
    }
};

export default Home;
