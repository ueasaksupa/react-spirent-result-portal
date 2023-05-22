import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { createTheme } from "react-data-table-component";
import * as XLSX from "xlsx";

import backend from "../api/backend";

const SubHeader = (props) => {
    return (
        <div>
            <span role="button" className="mx-2" onClick={props.onExportHandler}>
                <i title="delete" className="fas fa-download" />
                {"  "}Export(.xlsx)
            </span>
            <input type="text" placeholder="search" onChange={props.onSearchChangeHandler} />
        </div>
    );
};

const FpsTemplate = () => {
    const staticResult = useRef();

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    //
    const fetchTemplate = async () => {
        // get results
        try {
            const resultReps = await backend.get("/template");
            console.log("template:: ", resultReps.data);

            // prepare data for data-table
            const tmp = resultReps.data.map((row) => ({ "Stream Block": row.name, fps: row.fps }));
            staticResult.current = tmp;
            setData(tmp);
        } catch (error) {
            console.log(error);
            setError(true);
        }
    };
    //
    const onSearchChangeHandler = (e) => {
        const value = e.target.value;
        const tmp = [];
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

    const onExportHandler = () => {
        let DEFAULT_DATA = [
            { "Stream Block": "EDIT ME 1", fps: 1 },
            { "Stream Block": "EDIT ME 2", fps: 2 },
        ];
        let sheet = XLSX.utils.json_to_sheet(data.length === 0 ? DEFAULT_DATA : data);

        // add to workbook
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, `fps template`);

        // write file
        XLSX.writeFile(wb, `fps-template.xlsx`);
    };

    useEffect(() => {
        document.title = "portal :: All FPS template";
        fetchTemplate();
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
            name: "Stream block",
            selector: (row) => row["Stream Block"],
            sortable: true,
        },
        {
            name: "FPS",
            selector: (row) => row.fps,
            sortable: true,
        },
    ];
    //
    // check if all data ready
    if (data) {
        return (
            <div className="container-fluid">
                <DataTable
                    title="FPS template"
                    highlightOnHover
                    pointerOnHover
                    pagination
                    paginationPerPage={40}
                    paginationRowsPerPageOptions={[10, 40, 70, 100]}
                    defaultSortField="name"
                    defaultSortAsc={false}
                    subHeader
                    subHeaderComponent={
                        <SubHeader onExportHandler={onExportHandler} onSearchChangeHandler={onSearchChangeHandler} />
                    }
                    dense
                    columns={columns}
                    data={data}
                    theme="solarized"
                />
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

export default FpsTemplate;
