import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTimes,
	faEdit,
	faTrash,
	faUserFriends,
	faCheckCircle,
	faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import "./LogDetailsModal.css";

const LogDetailsModal = ({
	log,
	isOpen,
	onClose,
	onEdit,
	onDelete,
	isEditable,
}) => {
	if (!isOpen || !log) return null;

	// Format date for display
	const formatDate = (dateString) => {
		const options = { year: "numeric", month: "short", day: "numeric" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this log?")) {
			onDelete(log.classLogId);
			onClose();
		}
	};

	const handleEdit = () => {
		onEdit(log);
		onClose();
	};

	return (
		<div className="ldm-overlay">
			<div className="ldm-container">
				<div className="ldm-header">
					<h3>{log.lectureTitle}</h3>
					<button
						className="ldm-close-btn"
						onClick={onClose}
						aria-label="Close modal"
					>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<div className="ldm-body">
					<div className="ldm-details-grid">
						<div className="ldm-detail-row">
							<div className="ldm-detail-label">Date</div>
							<div className="ldm-detail-value">
								{formatDate(log.classDate)}
							</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">Subject</div>
							<div className="ldm-detail-value">{log.subject}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">Period</div>
							<div className="ldm-detail-value">{log.period}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">Sequence</div>
							<div className="ldm-detail-value">{log.sequence}</div>
						</div>
					</div>

					<div className="ldm-attendance-section">
						<h4>
							<FontAwesomeIcon icon={faUserFriends} />
							<span>Student Attendance</span>
						</h4>

						{log.absentStudents && log.absentStudents.length > 0 ? (
							<>
								<div className="ldm-attendance-summary">
									<FontAwesomeIcon
										icon={faUserSlash}
										className="ldm-summary-icon ldm-absent"
									/>
									<span>{log.absentStudents.length} students absent</span>
								</div>

								<div className="ldm-absent-students">
									{log.absentStudents.map((student, index) => (
										<div key={index} className="ldm-absent-student">
											<FontAwesomeIcon icon={faUserSlash} />
											<span>{student.name}</span>
										</div>
									))}
								</div>
							</>
						) : (
							<div className="ldm-attendance-summary ldm-full">
								<FontAwesomeIcon
									icon={faCheckCircle}
									className="ldm-summary-icon ldm-present"
								/>
								<span>All students present</span>
							</div>
						)}
					</div>
				</div>

				<div className="ldm-footer">
					{isEditable && (
						<button className="ldm-btn ldm-btn-primary" onClick={handleEdit}>
							<FontAwesomeIcon icon={faEdit} />
							<span>Edit</span>
						</button>
					)}

					<button className="ldm-btn ldm-btn-danger" onClick={handleDelete}>
						<FontAwesomeIcon icon={faTrash} />
						<span>Delete</span>
					</button>

					<button className="ldm-btn ldm-btn-secondary" onClick={onClose}>
						<span>Close</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default LogDetailsModal;
