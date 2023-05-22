import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import backend from "../api/backend";

import DataTable, { createTheme } from "react-data-table-component";
import UploadedFile from "./UploadedFile";

const SubHeader = (props) => {
    return <input type="text" placeholder="search" onChange={props.onSearchChangeHandler} />;
};

const ResultDetail = (props) => {
    const staticResult = useRef();
    const testcaseName = useRef();
    const [files, setFiles] = useState(null);
    const [error, setError] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [data, setData] = useState(null);
    const [filter, setFilter] = useState({
        showBG: true,
        showBwService: true,
        showLtService: true,
        showSpService: true,
        search: "",
    });
    let { testId } = useParams();

    useEffect(() => {
        document.title = "portal :: Result detail";
        preProcessData();
        console.log(testId);
    }, [testId]);

    const preProcessData = async () => {
        let result, testcases, template;
        // get result
        try {
            let resultResp = await backend.get(`/result/${testId}`);

            console.log("resultDetail:: ", resultResp.data);
            let results = resultResp.data.docs.reduce((prev, curr) => {
                return [...prev, ...curr.results];
            }, []);

            setFiles(resultResp.data.docs);

            // prepare data for data-table first time
            let tmp = [];
            console.log(results);
            for (let stream of results) {
                tmp.push({ ...stream });
            }
            staticResult.current = tmp;
            setData(tmp);
        } catch (err) {
            // console.log(err);
            setError({ ...err });
        }
    };

    const applyFilter = () => {
        let tmp = [];
        for (const row of staticResult.current) {
            for (const col in row) {
                if (row[col]) {
                    if (row[col].toString().includes(filter.search)) {
                        tmp.push(row);
                        break;
                    }
                }
            }
        }
        return tmp;
    };

    const onSearchChangeHandler = (e) => {
        const type = e.target.type;
        const value = type === "checkbox" ? e.target.checked : e.target.value;
        const name = e.target.name;
        if (type === "checkbox") {
            setFilter({ ...filter, [name]: value });
        } else {
            setFilter({ ...filter, search: value });
        }
    };

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
            name: "Stream Block",
            selector: (row) => row.name,
            sortable: true,
            grow: 2,
        },
        {
            name: "Dropped Frame Count",
            selector: (row) => row.dropcount,
            sortable: true,
            right: true,
        },
        {
            name: "Tx",
            selector: (row) => row.tx,
            sortable: true,
            right: true,
        },
        {
            name: "Rx",
            selector: (row) => row.rx,
            sortable: true,
            right: true,
        },
        {
            name: "Frame/second",
            selector: (row) => row.fps,
            sortable: true,
            right: true,
        },
        {
            name: "droptime(ms)",
            selector: (row) => row.droptime_ms,
            sortable: true,
            right: true,
        },
    ];

    if (data) {
        return (
            <div className="container-fluid">
                <UploadedFile files={files} preProcessData={preProcessData} testId={testId} />
                <DataTable
                    title={testcaseName.current}
                    highlightOnHover
                    pagination
                    paginationPerPage={40}
                    paginationRowsPerPageOptions={[10, 40, 70, 100]}
                    defaultSortField="droptime"
                    defaultSortAsc={false}
                    subHeader
                    subHeaderComponent={<SubHeader onSearchChangeHandler={onSearchChangeHandler} />}
                    dense
                    columns={columns}
                    data={applyFilter()}
                    theme="solarized"
                />
            </div>
        );
    } else {
        if (error) {
            if (error.response) {
                return (
                    <div className="text-center">
                        {error.response.status}
                        {error.response.statusText}
                    </div>
                );
            } else {
                return <div className="text-center">NETWORK ERROR : check backend connection</div>;
            }
        } else {
            return <div className="text-center">Loading ...</div>;
        }
    }
};

export default ResultDetail;
