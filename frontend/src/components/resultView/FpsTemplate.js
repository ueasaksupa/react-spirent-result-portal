import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import backend from "../api/backend";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import DataTable, { createTheme } from "react-data-table-component";

const FpsTemplate = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    //
    const fetchTemplate = async () => {
        let results, testcases;
        // get results
        console.log("preprocess data");
        try {
            const resultReps = await backend.get("/template");
            if (resultReps.status === 200) {
                console.log("template:: ", resultReps.data);
                results = resultReps.data;
            } else {
                setError(true);
            }
            // prepare data for data-table
            const tmp = results.map((row) => {
                return {
                    name: row.name,
                    fps: row.fps,
                };
            });
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

        for (const row of data) {
            for (const col in row) {
                if (row[col].toString().includes(value)) {
                    tmp.push(row);
                    break;
                }
            }
        }
        setData(tmp);
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
            selector: (row) => row.name,
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
