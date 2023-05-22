import axios from "axios";

const API_ADDRESS = process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL.replace(/\/+$/, "")}`
    : `http://localhost:5001`;

export default axios.create({
    baseURL: `${API_ADDRESS.replace(/\/+$/, "")}/api`,
});
