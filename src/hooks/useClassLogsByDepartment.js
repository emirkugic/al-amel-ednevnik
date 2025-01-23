import { useState, useEffect } from "react";
import classLogApi from "../api/classLogApi";

const useClassLogsByDepartment = (user, departmentId) => {
	const [classLogs, setClassLogs] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchClassLogsByDepartment = async () => {
		try {
			setLoading(true);
			const data = await classLogApi.getClassLogsByDepartment(
				departmentId,
				user?.token
			);
			setClassLogs(data || {});
		} catch (err) {
			console.error("Error fetching class logs by department:", err);
			setError("Failed to fetch class logs.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user?.token && departmentId) {
			fetchClassLogsByDepartment();
		}
	}, [user?.token, departmentId]);

	return {
		classLogs,
		loading,
		error,
	};
};

export default useClassLogsByDepartment;
