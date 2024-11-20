import apiClient from "./apiClient";

const teacherApi = {
	getAllTeachers: async (token) => {
		const response = await apiClient.get("/Teacher", {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	getTeacherById: async (id, token) => {
		const response = await apiClient.get(`/Teacher/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	createTeacher: async (teacher, token) => {
		const response = await apiClient.post("/Teacher", teacher, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	deleteTeacher: async (id, token) => {
		await apiClient.delete(`/Teacher/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};

export default teacherApi;
