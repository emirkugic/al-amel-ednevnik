import { useState, useEffect } from "react";
import absenceApi from "../api/absenceApi";

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

	const updateAbsence = async (absenceId, isExcused, reason) => {
		const previousAbsences = [...absences];
		const updated = absences.map((rec) =>
			rec.absence.id === absenceId
				? {
						...rec,
						absence: {
							...rec.absence,
							isExcused,
							reason,
						},
				  }
				: rec
		);
		setAbsences(updated);

		try {
			await absenceApi.updateAbsence(absenceId, isExcused, reason, token);
		} catch (err) {
			setAbsences(previousAbsences);
			throw err;
		}
	};

	return { absences, loading, error, updateAbsence, setAbsences };
};

export default useAbsences;
