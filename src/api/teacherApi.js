// src/api/teacherApi.js
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
	updateTeacher: async (id, teacher, token) => {
		const response = await apiClient.put(`/Teacher/${id}`, teacher, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
	deleteTeacher: async (id, token) => {
		await apiClient.delete(`/Teacher/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},

	// Subject Management endpoints
	addSubjectToTeacher: async (teacherId, assignedSubject, token) => {
		const response = await apiClient.post(
			`/Teacher/${teacherId}/add-subject`,
			assignedSubject,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},
	removeSubjectFromTeacher: async (teacherId, subjectId, token) => {
		const response = await apiClient.delete(
			`/Teacher/${teacherId}/remove-subject/${subjectId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},
};

export default teacherApi;
