import React from "react";
import "./MobileLogDetailsModal.css";

const MobileLogDetailsModal = ({ log, onClose, onDelete }) => {
	if (!log) return null;

	const tooltipContent =
		log.absentStudents && log.absentStudents.length > 0
			? log.absentStudents.map((student) => student.name).join(", ")
			: "All present";

	return (
		<div className="mobile-log-details-modal-overlay">
			<div className="mobile-log-details-modal">
				<h3>Class Details</h3>
				<p>
					<strong>Date:</strong> {new Date(log.classDate).toLocaleDateString()}
				</p>
				<p>
					<strong>Subject:</strong> {log.subject}
				</p>
				<p>
					<strong>Period:</strong> {log.period}
				</p>
				<p>
					<strong>Lecture Title:</strong> {log.lectureTitle}
				</p>
				<p>
					<strong>Sequence:</strong> {log.sequence}
				</p>
				<p>
					<strong>Absent Students:</strong> {tooltipContent}
				</p>

				<div className="mobile-log-details-modal-actions">
					<button
						className="delete-log-button"
						onClick={() => onDelete(log.classLogId)}
					>
						Delete
					</button>
					<button className="close-modal-button" onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default MobileLogDetailsModal;
