import { useState, useEffect } from "react";
import { absenceApi } from "../api";

const useAbsences = (departmentId, token) => {
	const [absences, setAbsences] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!departmentId || !token) return;

		const fetchAbsences = async () => {
			try {
				const data = await absenceApi.getAbsenceByDepartmentIdForCurrentYear(
					departmentId,
					token
				);
				setAbsences(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchAbsences();
	}, [departmentId, token]);

	return { absences, loading, error };
};

export default useAbsences;
