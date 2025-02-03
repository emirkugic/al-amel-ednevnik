import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faSave } from "@fortawesome/free-solid-svg-icons";
import "./AssessmentGradesModal.css";
import useGrades from "../../../../hooks/useGrades";

const AssessmentGradesModal = ({ assessment, token, onClose }) => {
	const { grades, fetchGrades, updateGrade, createGrade } = useGrades(token);
	const [editing, setEditing] = useState({});
	const [localGrades, setLocalGrades] = useState({});

	useEffect(() => {
		if (assessment) {
			fetchGrades(assessment.id);
		}
	}, [assessment]);

	useEffect(() => {
		setLocalGrades(
			grades.reduce((acc, grade) => {
				acc[grade.studentId] = grade.grade || "";
				return acc;
			}, {})
		);
	}, [grades]);

	const handleGradeChange = (studentId, grade) => {
		// Convert input to string before saving
		const gradeString = String(grade).trim();

		// Ensure the grade does not exceed the maximum assessment points
		if (Number(grade) > Number(assessment.points)) {
			alert(`Grade cannot exceed the maximum points (${assessment.points})`);
			return;
		}

		setLocalGrades({ ...localGrades, [studentId]: gradeString });
		setEditing({ ...editing, [studentId]: true });
	};

	const saveGrade = async (studentId) => {
		const gradeToUpdate = grades.find((g) => g.studentId === studentId);

		if (!gradeToUpdate || !gradeToUpdate.gradeId) {
			// If no grade exists, create a new one
			await createGrade({
				studentId,
				subjectAssessmentId: assessment.id,
				grade: String(localGrades[studentId]), // ✅ Ensure string conversion
			});
		} else if (gradeToUpdate.grade !== localGrades[studentId]) {
			// Update the existing grade
			await updateGrade(gradeToUpdate.gradeId, {
				id: gradeToUpdate.gradeId,
				subjectAssessmentId: assessment.id,
				studentId,
				grade: String(localGrades[studentId]), // ✅ Ensure string conversion
			});
		}

		// Re-fetch all grades so new or updated items show correct data
		await fetchGrades(assessment.id);

		// Turn off editing mode for this student
		setEditing({ ...editing, [studentId]: false });
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<h2>Grades for {assessment.title}</h2>
				<table className="student-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Grade</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{grades.map((grade) => (
							<tr key={grade.gradeId || grade.studentId}>
								<td>{grade.studentName}</td>
								<td>
									{editing[grade.studentId] ? (
										<input
											type="number"
											step="0.1" // ✅ Allows decimal grading (e.g., 0.5, 1.2)
											min="0"
											max={assessment.points}
											value={localGrades[grade.studentId]}
											onChange={(e) =>
												handleGradeChange(grade.studentId, e.target.value)
											}
										/>
									) : (
										localGrades[grade.studentId] || "Not Graded"
									)}
								</td>
								<td>
									{editing[grade.studentId] ? (
										<button
											onClick={() => saveGrade(grade.studentId)}
											className="action-button save"
										>
											<FontAwesomeIcon icon={faSave} />
										</button>
									) : (
										<button
											onClick={() =>
												setEditing({ ...editing, [grade.studentId]: true })
											}
											className="action-button edit"
										>
											<FontAwesomeIcon icon={faPen} />
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AssessmentGradesModal;
