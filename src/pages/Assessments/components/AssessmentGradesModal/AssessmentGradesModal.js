import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faSave } from "@fortawesome/free-solid-svg-icons";
import "./AssessmentGradesModal.css";

const AssessmentGradesModal = ({ assessment, students, onClose }) => {
	const [grades, setGrades] = useState(
		students.reduce((acc, student) => {
			acc[student.studentId] = student.grade || "";
			return acc;
		}, {})
	);
	const [editing, setEditing] = useState({});

	const handleGradeChange = (studentId, grade) => {
		setGrades({ ...grades, [studentId]: grade });
		setEditing({ ...editing, [studentId]: true });
	};

	const saveGrade = (studentId) => {
		// Add logic to save or update grades here
		setEditing({ ...editing, [studentId]: false });
	};

	const classAverage = (
		students
			.filter((student) => student.grade !== null)
			.reduce((sum, student) => sum + parseFloat(student.grade || 0), 0) /
		students.filter((student) => student.grade !== null).length
	).toFixed(2);

	const highestGrade = Math.max(
		...students.map((student) => parseFloat(student.grade || 0))
	);

	const lowestGrade = Math.min(
		...students
			.filter((student) => student.grade !== null)
			.map((student) => parseFloat(student.grade || 0))
	);

	const passingRate = (
		(students.filter((student) => student.grade >= 6).length /
			students.length) *
		100
	).toFixed(2);

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Grades for {assessment.title}</h2>
					<button className="close-button" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="stats">
					<div className="stat-box average">
						<span>Class Average</span>
						<h3>{classAverage}</h3>
					</div>
					<div className="stat-box highest">
						<span>Highest Grade</span>
						<h3>{highestGrade}</h3>
					</div>
					<div className="stat-box lowest">
						<span>Lowest Grade</span>
						<h3>{lowestGrade}</h3>
					</div>
					<div className="stat-box passing">
						<span>Passing Rate</span>
						<h3>{passingRate}%</h3>
					</div>
				</div>

				<table className="student-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Grade</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{students.map((student) => (
							<tr key={student.studentId}>
								<td>{student.studentName}</td>
								<td>
									{editing[student.studentId] ? (
										<input
											type="number"
											min="1"
											max="10"
											value={grades[student.studentId]}
											onChange={(e) =>
												handleGradeChange(student.studentId, e.target.value)
											}
										/>
									) : (
										grades[student.studentId] || "Not Graded"
									)}
								</td>
								<td>
									{editing[student.studentId] ? (
										<button
											onClick={() => saveGrade(student.studentId)}
											className="action-button save"
										>
											<FontAwesomeIcon icon={faSave} />
										</button>
									) : (
										<button
											onClick={() =>
												setEditing({ ...editing, [student.studentId]: true })
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
