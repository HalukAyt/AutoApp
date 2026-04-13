import axios from "axios";  

export default function api() {
    const BASE_URL = "http://10.0.2.2:8080/api";
    
    return axios.create({
        baseURL: BASE_URL,
        headers: { "Content-Type": "application/json" },
    });
} 