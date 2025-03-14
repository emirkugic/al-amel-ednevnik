import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTimes,
	faEdit,
	faTrash,
	faUserFriends,
	faCheckCircle,
	faUserSlash,
	faUser,
	faBookOpen,
	faSchool,
	faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import "./LogDetailsModal.css";
import useAuth from "../../hooks/useAuth";

const LogDetailsModal = ({
	isOpen,
	onClose,
	onEdit,
	onDelete,
	isEditable,
	detailedLog,
	loadingDetails,
	errorDetails,
	initialTitle,
	requestId,
}) => {
	const { user } = useAuth();

	// Track which request is currently being rendered
	const [currentRequest, setCurrentRequest] = useState(null);

	// Reset the rendered data when requestId changes
	useEffect(() => {
		if (requestId) {
			setCurrentRequest(requestId);
		}
	}, [requestId]);

	// Don't render anything if modal isn't open
	if (!isOpen) return null;

	// Show error state if there was an error fetching details
	if (errorDetails) {
		return (
			<div className="ldm-overlay">
				<div className="ldm-container">
					<div className="ldm-header">
						<h3>Error</h3>
						<button
							className="ldm-close-btn"
							onClick={onClose}
							aria-label="Close modal"
						>
							<FontAwesomeIcon icon={faTimes} />
						</button>
					</div>
					<div className="ldm-body">
						<div className="ldm-error">
							<p>{errorDetails}</p>
						</div>
					</div>
					<div className="ldm-footer">
						<button className="ldm-btn ldm-btn-secondary" onClick={onClose}>
							<span>Close</span>
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Show loading state if data is loading or not yet available
	const isDataReady = !loadingDetails && detailedLog && detailedLog.classLog;

	if (!isDataReady) {
		return (
			<div className="ldm-overlay">
				<div className="ldm-container">
					<div className="ldm-header">
						<h3>{initialTitle || "Loading details..."}</h3>
						<button
							className="ldm-close-btn"
							onClick={onClose}
							aria-label="Close modal"
						>
							<FontAwesomeIcon icon={faTimes} />
						</button>
					</div>
					<div className="ldm-body">
						<div className="ldm-loading-container">
							<FontAwesomeIcon icon={faSpinner} spin className="ldm-spinner" />
							<p>Loading log details...</p>
						</div>
					</div>
					<div className="ldm-footer">
						<button className="ldm-btn ldm-btn-secondary" onClick={onClose}>
							<span>Close</span>
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Extract data from the detailed log
	const logData = detailedLog.classLog;
	const lectureTitle = logData.lectureTitle;
	const classDate = logData.classDate;
	const subjectName = detailedLog.subjectName;
	const period = logData.period;
	const sequence = logData.sequence;
	const teacherId = logData.teacherId;
	const classLogId = logData.id;
	const absentStudents = detailedLog.absentStudents || [];

	const isCreator = teacherId === user?.id;

	const canEdit =
		isEditable !== undefined ? isEditable : isCreator || user?.role === "Admin";
	const canDelete = isCreator || user?.role === "Admin";

	// Format date for display
	const formatDate = (dateString) => {
		const options = { year: "numeric", month: "short", day: "numeric" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this log?")) {
			onDelete(classLogId);
			onClose();
		}
	};

	const handleEdit = () => {
		const formattedLog = {
			classLogId: logData.id,
			departmentId: logData.departmentId,
			subjectId: logData.subjectId,
			teacherId: logData.teacherId,
			lectureTitle: logData.lectureTitle,
			classDate: logData.classDate,
			period: logData.period,
			sequence: logData.sequence,
			absentStudents: detailedLog.absentStudents || [],
			subject: detailedLog.subjectName,
		};
		onEdit(formattedLog);
		onClose();
	};

	return (
		<div className="ldm-overlay">
			<div className="ldm-container">
				<div className="ldm-header">
					<h3>{lectureTitle}</h3>
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
							<div className="ldm-detail-value">{formatDate(classDate)}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">Subject</div>
							<div className="ldm-detail-value">{subjectName}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">Period</div>
							<div className="ldm-detail-value">{period}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">Sequence</div>
							<div className="ldm-detail-value">{sequence}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">
								<FontAwesomeIcon icon={faUser} className="ldm-detail-icon" />
								Teacher
							</div>
							<div className="ldm-detail-value">{detailedLog.teacherName}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">
								<FontAwesomeIcon icon={faSchool} className="ldm-detail-icon" />
								Class
							</div>
							<div className="ldm-detail-value">
								{detailedLog.departmentName}
							</div>
						</div>
					</div>

					<div className="ldm-attendance-section">
						<h4>
							<FontAwesomeIcon icon={faUserFriends} />
							<span>Student Attendance</span>
						</h4>

						{absentStudents && absentStudents.length > 0 ? (
							<>
								<div className="ldm-attendance-summary">
									<FontAwesomeIcon
										icon={faUserSlash}
										className="ldm-summary-icon ldm-absent"
									/>
									<span>{absentStudents.length} students absent</span>
								</div>

								<div className="ldm-absent-students">
									{absentStudents.map((student, index) => (
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
					{canEdit && onEdit && (
						<button className="ldm-btn ldm-btn-primary" onClick={handleEdit}>
							<FontAwesomeIcon icon={faEdit} />
							<span>Edit</span>
						</button>
					)}

					{canDelete && onDelete && (
						<button className="ldm-btn ldm-btn-danger" onClick={handleDelete}>
							<FontAwesomeIcon icon={faTrash} />
							<span>Delete</span>
						</button>
					)}

					<button className="ldm-btn ldm-btn-secondary" onClick={onClose}>
						<span>Close</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default LogDetailsModal;
