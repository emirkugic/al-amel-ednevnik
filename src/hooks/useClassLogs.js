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

	useEffect(() => {
		const storedLogs = localStorage.getItem("classLogs");
		if (user && user.token) {
			// Fetch class logs if user is authenticated
			if (!storedLogs) {
				fetchClassLogs(user.token, user.id);
			} else {
				setClassLogs(JSON.parse(storedLogs));
				setLoading(false);
			}
		} else {
			setClassLogs([]);
		}
	}, [user]);

	return { classLogs, fetchClassLogs, loading, error };
};

export default useClassLogs;
