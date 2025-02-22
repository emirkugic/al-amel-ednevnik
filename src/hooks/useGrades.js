import { useState } from "react";
import gradeApi from "../api/gradeApi";

const useGrades = (token) => {
	const [grades, setGrades] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch grades for a specific assessment
	const fetchGrades = async (assessmentId) => {
		try {
			setLoading(true);
			const response = await gradeApi.getGradesByAssessment(
				assessmentId,
				token
			);
			setGrades(response);
		} catch (err) {
			console.error("Error fetching grades:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	const fetchGradesByDepartment = async (departmentId) => {
		try {
			setLoading(true);
			const response = await gradeApi.getGradesByDepartment(
				departmentId,
				token
			);
			setGrades(response);
		} catch (err) {
			console.error("Error fetching grades by department:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	// Update a specific grade
	const updateGrade = async (gradeId, updatedData) => {
		try {
			if (!gradeId) {
				console.error("Grade ID is required for update.");
				throw new Error("Grade ID is missing or invalid.");
			}
			setLoading(true);
			await gradeApi.updateGrade(gradeId, updatedData, token);
			setGrades((prevGrades) =>
				prevGrades.map((grade) =>
					grade.gradeId === gradeId ? { ...grade, ...updatedData } : grade
				)
			);
		} catch (err) {
			console.error("Error updating grade:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	// Create a new grade for a student
	const createGrade = async (newGradeData) => {
		try {
			setLoading(true);
			const response = await gradeApi.createGrade(newGradeData, token);
			// Replace the placeholder entry or add the new grade
			setGrades((prevGrades) => {
				// Remove any existing placeholder for the student
				const filteredGrades = prevGrades.filter(
					(grade) => grade.studentId !== newGradeData.studentId
				);
				// Add the newly created grade
				return [...filteredGrades, { ...newGradeData, id: response.id }];
			});
		} catch (err) {
			console.error("Error creating grade:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	return {
		grades,
		loading,
		error,
		fetchGrades,
		fetchGradesByDepartment,
		updateGrade,
		createGrade,
	};
};

export default useGrades;
