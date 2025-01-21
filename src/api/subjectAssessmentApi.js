import apiClient from "./apiClient";

const subjectAssessmentApi = {
	// Get all assessments (not used by default, but handy if you need it)
	getAllAssessments: async (token) => {
		const response = await apiClient.get("/SubjectAssessment", {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	// Get filtered assessments
	getFilteredAssessments: async (
		teacherId,
		subjectId,
		departmentId,
		schoolYearStart,
		token
	) => {
		const response = await apiClient.get("/SubjectAssessment/filtered", {
			headers: { Authorization: `Bearer ${token}` },
			params: {
				teacherId,
				subjectId,
				departmentId,
				schoolYearStart,
			},
		});
		return response.data;
	},

	// Create a new assessment
	createAssessment: async (assessmentData, token) => {
		const response = await apiClient.post(
			"/SubjectAssessment",
			assessmentData,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},

	// Update an existing assessment by ID
	updateAssessment: async (id, assessmentData, token) => {
		const response = await apiClient.put(
			`/SubjectAssessment/${id}`,
			assessmentData,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},

	// Delete an assessment by ID
	deleteAssessment: async (id, token) => {
		await apiClient.delete(`/SubjectAssessment/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};

export default subjectAssessmentApi;
