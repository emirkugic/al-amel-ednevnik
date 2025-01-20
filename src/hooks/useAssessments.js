import { useState, useEffect } from "react";
import subjectAssessmentApi from "../api/subjectAssessmentApi";

const useAssessments = (token) => {
	const [assessments, setAssessments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!token) return;

		const fetchAssessments = async () => {
			try {
				setLoading(true);
				const data = await subjectAssessmentApi.getAllAssessments(token);
				setAssessments(data);
			} catch (err) {
				console.error("Error fetching assessments:", err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchAssessments();
	}, [token]);

	const addAssessment = async (newAssessment, token) => {
		try {
			const created = await subjectAssessmentApi.createAssessment(
				newAssessment,
				token
			);
			setAssessments((prev) => [...prev, created]);
		} catch (err) {
			console.error("Error creating assessment:", err);
			setError(err);
		}
	};

	const updateAssessment = async (id, updatedAssessment, token) => {
		try {
			const updated = await subjectAssessmentApi.updateAssessment(
				id,
				updatedAssessment,
				token
			);
			setAssessments((prev) => prev.map((a) => (a.id === id ? updated : a)));
		} catch (err) {
			console.error("Error updating assessment:", err);
			setError(err);
		}
	};

	const deleteAssessment = async (id, token) => {
		try {
			await subjectAssessmentApi.deleteAssessment(id, token);
			setAssessments((prev) => prev.filter((a) => a.id !== id));
		} catch (err) {
			console.error("Error deleting assessment:", err);
			setError(err);
		}
	};

	return {
		assessments,
		loading,
		error,
		addAssessment,
		updateAssessment,
		deleteAssessment,
	};
};

export default useAssessments;
