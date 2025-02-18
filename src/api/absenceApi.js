import apiClient from "./apiClient";

const absenceApi = {
	getAbsenceByDepartmentIdForCurrentYear: async (id, token) => {
		const response = await apiClient.get(
			`/Absence/department/current-year-details/${id}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	},
};

export default absenceApi;
