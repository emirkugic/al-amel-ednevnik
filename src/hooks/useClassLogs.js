import { useState, useEffect } from "react";
import classLogApi from "../api/classLogApi";

const useClassLogs = (user) => {
	const [classLogs, setClassLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchClassLogs = async (token, teacherId) => {
		try {
			setLoading(true);
			const logs = await classLogApi.getClassLogsByTeacherGrouped(
				teacherId,
				token
			);
			setClassLogs(logs);
			localStorage.setItem("classLogs", JSON.stringify(logs));
		} catch (err) {
			setError("Failed to fetch class logs.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const fetchClassLogsByDepartment = async (token, departmentId) => {
		try {
			setLoading(true);
			const data = await classLogApi.getClassLogsByDepartment(
				departmentId,
				token
			);
			setClassLogs(data);
		} catch (err) {
			console.error("Error fetching class logs by department:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user && user.token) {
			fetchClassLogs(user.token, user.id);
		} else {
			setClassLogs([]);
		}
	}, [user]);

	return {
		classLogs,
		fetchClassLogs,
		setClassLogs,
		fetchClassLogsByDepartment,
		loading,
		error,
	};
};

export default useClassLogs;
