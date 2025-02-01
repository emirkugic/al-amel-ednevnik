import axios from "axios";

const useDeployedAPI = true;

const apiClient = axios.create({
	baseURL:
		typeof useDeployedAPI !== "undefined"
			? process.env.REACT_APP_API_URL || "https://al-amel-api.onrender.com/api"
			: "http://localhost:5155/api",
});

export default apiClient;
