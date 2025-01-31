import { useState, useEffect, useCallback } from "react";
import classLogApi from "../../../api/classLogApi";

const useClassLogs = (token) => {
	const [classLogs, setClassLogs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Function to fetch all class logs
	const fetchClassLogs = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await classLogApi.getAllClassLogs(token);
			setClassLogs(data);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [token]);

	// Automatically fetch class logs when the token is available
	useEffect(() => {
		if (token) {
			fetchClassLogs();
		}
	}, [token, fetchClassLogs]);

	return { classLogs, loading, error, refetch: fetchClassLogs };
};

export default useClassLogs;
