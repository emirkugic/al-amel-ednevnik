import apiClient from "./apiClient";

const parentApi = {
	getAllParents: async (token) => {
		const response = await apiClient.get("/Parent", {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	getParentById: async (id, token) => {
		const response = await apiClient.get(`/Parent/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	createParent: async (parentData, token) => {
		const response = await apiClient.post("/Parent", parentData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	updateParent: async (id, parentData, token) => {
		const response = await apiClient.put(`/Parent/${id}`, parentData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	deleteParent: async (id, token) => {
		await apiClient.delete(`/Parent/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},

	getChildrenByParentId: async (parentId, token) => {
		const response = await apiClient.get(`/Parent/${parentId}/children`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},
};

export default parentApi;
