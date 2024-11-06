import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faSave } from "@fortawesome/free-solid-svg-icons";
import "./AssessmentGradesModal.css";

const AssessmentGradesModal = ({ assessment, students, onClose }) => {
	const [grades, setGrades] = useState(
		students.reduce((acc, student) => {
			acc[student.id] = student.grade || "";
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

	const classAverage = 6.1;
	const highestGrade = 9.5;
	const lowestGrade = 1.0;
	const passingRate = 60;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					{/* <h2>Student Grade Management</h2> */}
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
							<th>Points (1-10)</th>
							<th>Progress</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{students.map((student) => (
							<tr key={student.id}>
								<td>{student.name}</td>
								<td
									className="grade"
									style={{ color: getGradeColor(grades[student.id]) }}
								>
									{editing[student.id] ? (
										<input
											type="number"
											min="1"
											max="10"
											value={grades[student.id]}
											onChange={(e) =>
												handleGradeChange(student.id, e.target.value)
											}
										/>
									) : (
										grades[student.id]
									)}
								</td>
								<td>
									<div className="progress-bar">
										<div
											className="progress-fill"
											style={{ width: `${(grades[student.id] / 10) * 100}%` }}
										></div>
									</div>
								</td>
								<td>
									{editing[student.id] ? (
										<button
											className="action-button save"
											onClick={() => saveGrade(student.id)}
										>
											<FontAwesomeIcon icon={faSave} />
										</button>
									) : (
										<button
											className="action-button edit"
											onClick={() =>
												setEditing({ ...editing, [student.id]: true })
											}
										>
											<FontAwesomeIcon icon={faPen} />
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				<p className="grading-scale">
					Grading Scale: 1-5 (Failing), 6-7 (Satisfactory), 8-9 (Good), 10
					(Excellent)
				</p>
			</div>
		</div>
	);
};

// Helper function to determine grade color based on value
const getGradeColor = (grade) => {
	if (grade >= 8) return "green";
	if (grade >= 6) return "blue";
	if (grade >= 4) return "orange";
	return "red";
};

export default AssessmentGradesModal;
