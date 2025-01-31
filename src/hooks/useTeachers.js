import { useState, useEffect, useCallback } from "react";
import teacherApi from "../api/teacherApi";

const useTeachers = (token) => {
	const [teachers, setTeachers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchTeachers = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await teacherApi.getAllTeachers(token);
			setTeachers(data);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		if (token) {
			fetchTeachers();
		}
	}, [token, fetchTeachers]);

	return { teachers, loading, error, refetch: fetchTeachers };
};

export default useTeachers;
