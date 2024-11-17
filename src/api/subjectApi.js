import apiClient from "./apiClient";

const subjectApi = {
	getAllSubjects: async (token) => {
		const response = await apiClient.get("/Subject", {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	getSubjectById: async (id, token) => {
		const response = await apiClient.get(`/Subject/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	createSubject: async (subject, token) => {
		const response = await apiClient.post("/Subject", subject, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	updateSubject: async (id, subject, token) => {
		const response = await apiClient.put(`/Subject/${id}`, subject, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	deleteSubject: async (id, token) => {
		await apiClient.delete(`/Subject/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};

export default subjectApi;
