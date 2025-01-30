import apiClient from "./apiClient";

const classLogApi = {
	// Get all class logs
	getAllClassLogs: async (token) => {
		const response = await apiClient.get("/ClassLog", {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	// Get class log by ID
	getClassLogById: async (id, token) => {
		const response = await apiClient.get(`/ClassLog/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	// Create a new class log
	createClassLog: async (classLogData, token) => {
		const response = await apiClient.post("/ClassLog", classLogData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	// Create a new class log with absences
	createClassLogWithAbsences: async (classLogWithAbsencesData, token) => {
		const response = await apiClient.post(
			"/ClassLog/create-with-absences",
			classLogWithAbsencesData,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},

	// ✅ Update class log using new DTO format
	updateClassLog: async (id, updatedLogData, token) => {
		console.log(
			"Sending request to update log:",
			JSON.stringify(updatedLogData, null, 2)
		);
		const response = await apiClient.put(`/ClassLog/${id}`, updatedLogData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	// Delete a class log
	deleteClassLog: async (id, token) => {
		await apiClient.delete(`/ClassLog/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},

	// Get logged classes by department and subject
	getLoggedClassesByDepartmentAndSubject: async (
		departmentId,
		subjectId,
		token
	) => {
		const response = await apiClient.get(
			`/ClassLog/by-department-and-subject?departmentId=${departmentId}&subjectId=${subjectId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},

	getClassLogsByDepartment: async (departmentId, token) => {
		const response = await apiClient.get(
			`/ClassLog/by-department-grouped-by-subject?departmentId=${departmentId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},

	getClassLogsByTeacherGrouped: async (teacherId, token) => {
		const response = await apiClient.get(
			`/ClassLog/by-teacher-grouped?teacherId=${teacherId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},
};

export default classLogApi;
