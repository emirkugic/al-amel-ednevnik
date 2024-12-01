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
			localStorage.setItem("classLogs", JSON.stringify(logs)); // Still cache if needed later
		} catch (err) {
			setError("Failed to fetch class logs.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user && user.token) {
			// Always fetch fresh logs on mount
			fetchClassLogs(user.token, user.id);
		} else {
			setClassLogs([]);
		}
	}, [user]); // Fetch logs whenever the user changes (e.g., login/logout)

	return { classLogs, fetchClassLogs, loading, error };
};

export default useClassLogs;
