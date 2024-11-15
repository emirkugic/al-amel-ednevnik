import React from "react";
import "./TeacherDetailsModal.css";

const TeacherDetailsModal = ({ teacher, onClose }) => {
	if (!teacher) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<h2>{`${teacher.name} ${teacher.surname}`}</h2>
				<p>
					<strong>Email:</strong> {teacher.email}
				</p>
				<h3>Subjects and Grades</h3>
				<ul>
					{teacher.subjects.map((subject, index) => (
						<li key={index}>
							<strong>{subject.subject}</strong>: {subject.grades.join(", ")}
						</li>
					))}
				</ul>
				<div className="modal-actions">
					<button className="close-button" onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default TeacherDetailsModal;
