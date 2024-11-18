import apiClient from "./apiClient";

const classApi = {
	getAllClasses: async (token) => {
		const response = await apiClient.get("/Class", {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	getClassById: async (id, token) => {
		const response = await apiClient.get(`/Class/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	createClass: async (classData, token) => {
		const response = await apiClient.post("/Class", classData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	updateClass: async (id, classData, token) => {
		const response = await apiClient.put(`/Class/${id}`, classData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	deleteClass: async (id, token) => {
		await apiClient.delete(`/Class/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};

export default classApi;
