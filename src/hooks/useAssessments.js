import { useState } from "react";
import subjectAssessmentApi from "../api/subjectAssessmentApi";

const useAssessments = (token) => {
	const [assessments, setAssessments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// const fetchAllAssessments = async () => {
	//   try {
	//     setLoading(true);
	//     const data = await subjectAssessmentApi.getAllAssessments(token);
	//     setAssessments(data);
	//   } catch (err) {
	//     console.error("Error fetching assessments:", err);
	//     setError(err);
	//   } finally {
	//     setLoading(false);
	//   }
	// };

	const fetchFilteredAssessments = async (
		teacherId,
		subjectId,
		departmentId,
		schoolYearStart
	) => {
		try {
			setLoading(true);
			console.log("Fetching filtered assessments with params:", {
				teacherId,
				subjectId,
				departmentId,
				schoolYearStart,
			});
			const response = await subjectAssessmentApi.getFilteredAssessments(
				teacherId,
				subjectId,
				departmentId,
				schoolYearStart,
				token
			);
			setAssessments(response);
		} catch (err) {
			console.error("Error fetching filtered assessments:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	const addAssessment = async (newAssessment) => {
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

	return {
		assessments,
		loading,
		error,
		fetchFilteredAssessments,
		addAssessment,
		// If needed, expose fetchAllAssessments or call it
		// fetchAllAssessments,
	};
};

export default useAssessments;
