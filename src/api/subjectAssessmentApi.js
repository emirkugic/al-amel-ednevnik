import apiClient from "./apiClient";

const subjectAssessmentApi = {
	getAllAssessments: async (token) => {
		const response = await apiClient.get("/SubjectAssessment", {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

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

	deleteAssessment: async (id, token) => {
		await apiClient.delete(`/SubjectAssessment/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};

export default subjectAssessmentApi;
