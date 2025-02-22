import apiClient from "./apiClient";

const gradeApi = {
	// Fetch grades for a specific assessment
	getGradesByAssessment: async (assessmentId, token) => {
		const response = await apiClient.get(
			`/AssessmentGrade/by-assessment/${assessmentId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},

	updateGrade: async (gradeId, data, token) => {
		if (!gradeId) {
			throw new Error("Grade ID is required to update a grade.");
		}

		const response = await apiClient.put(`/AssessmentGrade/${gradeId}`, data, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	// Create a new grade for a student
	createGrade: async (data, token) => {
		const response = await apiClient.post("/AssessmentGrade", data, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	getGradesByDepartment: async (departmentId, token) => {
		const response = await apiClient.get(
			`/AssessmentGrade/grades-by-department-id/${departmentId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},
};

export default gradeApi;
