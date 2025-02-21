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

	updateAbsence: async (absenceId, isExcused, reason, token) => {
		const payload = {
			absenceId,
			isExcused,
			reason,
		};
		const response = await apiClient.put("/Absence/update-absence", payload, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
};

export default absenceApi;
