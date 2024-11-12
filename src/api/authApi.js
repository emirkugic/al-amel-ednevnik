import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5155/api";

const authApi = {
	login: async (email, loginPassword) => {
		const response = await axios.post(`${BASE_URL}/Auth/login`, {
			email,
			loginPassword,
		});
		return response.data;
	},
};

export default authApi;
