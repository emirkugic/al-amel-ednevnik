import { useState } from "react";
import subjectAssessmentApi from "../api/subjectAssessmentApi";

const useAssessments = (token) => {
	const [assessments, setAssessments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Optional: If you ever need to fetch ALL assessments (unfiltered) in your UI
	// const fetchAllAssessments = async () => {
	//   try {
	//     setLoading(true);
	//     const data = await subjectAssessmentApi.getAllAssessments(token);
	//     setAssessments(data);
	//   } catch (err) {
	//     console.error("Error fetching all assessments:", err);
	//     setError(err);
	//   } finally {
	//     setLoading(false);
	//   }
	// };

	// Filtered fetch based on teacher, subject, department, and schoolYearStart
	const fetchFilteredAssessments = async (
		teacherId,
		subjectId,
		departmentId,
		schoolYearStart
	) => {
		try {
			setLoading(true);
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

	// Create a new assessment
	const addAssessment = async (newAssessment) => {
		try {
			setLoading(true);
			const created = await subjectAssessmentApi.createAssessment(
				newAssessment,
				token
			);
			setAssessments((prev) => [...prev, created]);
		} catch (err) {
			console.error("Error creating assessment:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	// Update an existing assessment
	const updateAssessment = async (id, updatedData) => {
		try {
			setLoading(true);
			const updated = await subjectAssessmentApi.updateAssessment(
				id,
				updatedData,
				token
			);
			// Replace the old version with the updated version in state
			setAssessments((prev) => prev.map((a) => (a.id === id ? updated : a)));
		} catch (err) {
			console.error("Error updating assessment:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	// Delete an existing assessment
	const deleteAssessment = async (id) => {
		try {
			setLoading(true);
			await subjectAssessmentApi.deleteAssessment(id, token);
			// Remove it from local state
			setAssessments((prev) => prev.filter((a) => a.id !== id));
		} catch (err) {
			console.error("Error deleting assessment:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	const fetchStudentsAndGrades = async (assessmentId) => {
		try {
			setLoading(true);
			const response =
				await subjectAssessmentApi.getStudentsAndGradesByAssessment(
					assessmentId,
					token
				);
			console.log("Students and grades fetched:", response);
			return response; // Return the fetched data
		} catch (err) {
			console.error("Error fetching students and grades:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	return {
		assessments,
		loading,
		error,
		// fetchAllAssessments, // if you want to expose the unfiltered fetch
		fetchFilteredAssessments,
		addAssessment,
		updateAssessment,
		deleteAssessment,
		fetchStudentsAndGrades,
	};
};

export default useAssessments;
