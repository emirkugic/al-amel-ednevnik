import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5155/api";

const subjectApi = {
	getAllSubjects: async (token) => {
		const response = await axios.get(`${BASE_URL}/Subject`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	getSubjectById: async (id, token) => {
		const response = await axios.get(`${BASE_URL}/Subject/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	createSubject: async (subject, token) => {
		console.log("Creating subject with payload:", subject); // Log payload
		const response = await axios.post(`${BASE_URL}/Subject`, subject, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	updateSubject: async (id, subject, token) => {
		const response = await axios.put(`${BASE_URL}/Subject/${id}`, subject, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	deleteSubject: async (id, token) => {
		await axios.delete(`${BASE_URL}/Subject/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};

export default subjectApi;
