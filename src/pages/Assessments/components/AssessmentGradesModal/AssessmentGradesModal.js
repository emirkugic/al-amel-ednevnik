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
		setLocalGrades({ ...localGrades, [studentId]: grade });
		setEditing({ ...editing, [studentId]: true });
	};

	const saveGrade = async (studentId) => {
		const gradeToUpdate = grades.find((g) => g.studentId === studentId);

		if (!gradeToUpdate || !gradeToUpdate.gradeId) {
			// If no grade exists, create a new one
			await createGrade({
				studentId,
				subjectAssessmentId: assessment.id,
				grade: localGrades[studentId],
			});
		} else if (gradeToUpdate.grade !== localGrades[studentId]) {
			// Update the existing grade using the correct gradeId
			console.log(
				"Updating grade:",
				gradeToUpdate.gradeId,
				localGrades[studentId]
			); // Debugging log
			await updateGrade(gradeToUpdate.gradeId, {
				id: gradeToUpdate.gradeId, // Include ID explicitly
				subjectAssessmentId: assessment.id,
				studentId,
				grade: localGrades[studentId],
			});
		}

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
											min="1"
											max="10"
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
