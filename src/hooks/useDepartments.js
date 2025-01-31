import { useState, useEffect, useCallback } from "react";
import departmentApi from "../api/departmentApi";

const useDepartments = (token) => {
	const [departments, setDepartments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch all departments
	const fetchDepartments = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await departmentApi.getAllDepartments(token);
			setDepartments(data);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [token]);

	// Create a new department and update local state
	const addDepartment = useCallback(
		async (departmentData) => {
			setLoading(true);
			setError(null);
			try {
				const newDepartment = await departmentApi.createDepartment(
					departmentData,
					token
				);
				setDepartments((prev) => [...prev, newDepartment]);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		},
		[token]
	);

	// Update an existing department and update local state
	const updateDepartment = useCallback(
		async (id, departmentData) => {
			setLoading(true);
			setError(null);
			try {
				const updatedDepartment = await departmentApi.updateDepartment(
					id,
					departmentData,
					token
				);
				setDepartments((prev) =>
					prev.map((dep) => (dep.id === id ? updatedDepartment : dep))
				);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		},
		[token]
	);

	// Delete a department and update local state
	const removeDepartment = useCallback(
		async (id) => {
			setLoading(true);
			setError(null);
			try {
				await departmentApi.deleteDepartment(id, token);
				setDepartments((prev) => prev.filter((dep) => dep.id !== id));
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		},
		[token]
	);

	// Automatically fetch departments when token is available
	useEffect(() => {
		if (token) {
			fetchDepartments();
		}
	}, [token, fetchDepartments]);

	return {
		departments,
		loading,
		error,
		fetchDepartments,
		addDepartment,
		updateDepartment,
		removeDepartment,
	};
};

export default useDepartments;
