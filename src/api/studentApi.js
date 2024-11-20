import apiClient from "./apiClient";

const studentApi = {
	getAllStudents: async (token) => {
		const response = await apiClient.get("/Student", {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	getStudentById: async (id, token) => {
		const response = await apiClient.get(`/Student/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	createStudent: async (studentData, token) => {
		const response = await apiClient.post("/Student", studentData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	updateStudent: async (id, studentData, token) => {
		const response = await apiClient.put(`/Student/${id}`, studentData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	deleteStudent: async (id, token) => {
		await apiClient.delete(`/Student/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};

export default studentApi;
