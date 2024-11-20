import apiClient from "./apiClient";

const departmentApi = {
	getAllDepartments: async (token) => {
		const response = await apiClient.get("/Department", {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	createDepartment: async (departmentData, token) => {
		const response = await apiClient.post("/Department", departmentData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;	
	},

	updateDepartment: async (id, departmentData, token) => {
		const response = await apiClient.put(`/Department/${id}`, departmentData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	deleteDepartment: async (id, token) => {
		await apiClient.delete(`/Department/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};

export default departmentApi;
