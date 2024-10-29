import React, { useState } from "react";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import "./AssessmentGradesModal.css";

const AssessmentGradesModal = ({ assessment, onClose }) => {
	const [grades, setGrades] = useState({});
	const students = [
		{ id: 1, name: "John Doe" },
		{ id: 2, name: "Jane Smith" },
		{ id: 3, name: "Mike Johnson" },
	];

	const handleGradeChange = (studentId, grade) => {
		setGrades({
			...grades,
			[studentId]: grade,
		});
	};

	const handleSave = () => {
		console.log("Saved grades for assessment:", assessment.name, grades);
		onClose();
	};

	return (
		<div className="modal-background">
			<div className="grades-modal">
				<div className="modal-header">
					<h3>{assessment.name} Grades</h3>
					<button className="close-button" onClick={onClose}>
						X
					</button>
				</div>
				<div className="modal-body">
					{students.map((student) => (
						<div key={student.id} className="student-grade">
							<p>{student.name}</p>
							<input
								type="number"
								placeholder="Enter grade"
								value={grades[student.id] || ""}
								onChange={(e) => handleGradeChange(student.id, e.target.value)}
								max="10"
							/>
						</div>
					))}
				</div>
				<div className="modal-footer">
					<PrimaryButton title="Save Grades" onClick={handleSave} />
				</div>
			</div>
		</div>
	);
};

export default AssessmentGradesModal;
