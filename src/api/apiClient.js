import axios from "axios";

const apiClient = axios.create({
	// baseURL: process.env.REACT_APP_API_URL || "http://localhost:5155/api",
	baseURL:
		process.env.REACT_APP_API_URL || "https://al-amel-api.onrender.com/api",
});

export default apiClient;
