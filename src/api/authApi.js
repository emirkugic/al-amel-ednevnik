import apiClient from "./apiClient";

const authApi = {
	login: async (email, loginPassword) => {
		const response = await apiClient.post("/Auth/login", {
			email,
			loginPassword,
		});
		return response.data;
	},
};

export default authApi;
