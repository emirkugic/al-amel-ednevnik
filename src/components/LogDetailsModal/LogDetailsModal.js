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
	faCalendarAlt,
	faBookOpen,
	faSchool,
	faLayerGroup,
	faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./LogDetailsModal.css";
import useAuth from "../../hooks/useAuth";

const LogDetailsModal = ({
	log, // Direct log data (from LoggedClassesOverview)
	isOpen,
	onClose,
	onEdit,
	onDelete,
	isEditable,
	detailedLog, // Hook-based log data (from WeeklyLogs)
	loadingDetails,
	errorDetails,
	initialTitle,
	requestId,
	fromOverviewPage = false, // Add this prop to indicate if coming from overview page
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
							<FontAwesomeIcon
								icon={faExclamationCircle}
								style={{ fontSize: "32px", marginBottom: "16px" }}
							/>
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

	const hasHookData = !loadingDetails && detailedLog && detailedLog.classLog;
	const hasDirectData = log && log.classLogId && log.lectureTitle;
	const isDataReady = hasHookData || hasDirectData;

	const isFromOverviewPage =
		fromOverviewPage || (hasDirectData && !hasHookData);

	if (!isDataReady) {
		return (
			<div className="ldm-overlay">
				<div className="ldm-container">
					<div className="ldm-header">
						<h3>{initialTitle || log?.lectureTitle || "Loading details..."}</h3>
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
							<div className="ldm-spinner"></div>
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

	let logData,
		lectureTitle,
		classDate,
		subjectName,
		period,
		sequence,
		teacherId,
		classLogId,
		teacherName,
		departmentName,
		absentStudents;

	if (hasHookData) {
		logData = detailedLog.classLog;
		lectureTitle = logData.lectureTitle;
		classDate = logData.classDate;
		subjectName = detailedLog.subjectName;
		period = logData.period;
		sequence = logData.sequence;
		teacherId = logData.teacherId;
		classLogId = logData.id;
		teacherName = detailedLog.teacherName;
		departmentName = detailedLog.departmentName;
		absentStudents = detailedLog.absentStudents || [];
	} else {
		// Direct data (LoggedClassesOverview)
		logData = log;
		lectureTitle = log.lectureTitle;
		classDate = log.classDate;
		subjectName = log.subject;
		period = log.period;
		sequence = log.sequence;
		teacherId = log.teacherId;
		classLogId = log.classLogId;
		teacherName = log.teacherName;
		departmentName = log.departmentName;
		absentStudents = log.absentStudents || [];
	}

	const isCreator = teacherId === user?.id;

	// Use provided isEditable prop if available, otherwise calculate based on user role and creator status
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
		// Create a consistent formatted log object regardless of data source
		const formattedLog = {
			classLogId: classLogId,
			departmentId: logData.departmentId,
			subjectId: logData.subjectId,
			teacherId: teacherId,
			lectureTitle: lectureTitle,
			classDate: classDate,
			period: period,
			sequence: sequence,
			absentStudents: absentStudents,
			subject: subjectName,
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
							<div className="ldm-detail-label">
								<FontAwesomeIcon
									icon={faCalendarAlt}
									className="ldm-detail-icon"
								/>
								Date
							</div>
							<div className="ldm-detail-value">{formatDate(classDate)}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">
								<FontAwesomeIcon
									icon={faBookOpen}
									className="ldm-detail-icon"
								/>
								Subject
							</div>
							<div className="ldm-detail-value">{subjectName}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">
								<FontAwesomeIcon
									icon={faLayerGroup}
									className="ldm-detail-icon"
								/>
								Period
							</div>
							<div className="ldm-detail-value">Period {period}</div>
						</div>

						<div className="ldm-detail-row">
							<div className="ldm-detail-label">
								<FontAwesomeIcon
									icon={faLayerGroup}
									className="ldm-detail-icon"
								/>
								Sequence
							</div>
							<div className="ldm-detail-value">#{sequence}</div>
						</div>

						{/* Only show Teacher and Class when not in overview page */}
						{!isFromOverviewPage && (
							<>
								<div className="ldm-detail-row">
									<div className="ldm-detail-label">
										<FontAwesomeIcon
											icon={faUser}
											className="ldm-detail-icon"
										/>
										Teacher
									</div>
									<div className="ldm-detail-value">{teacherName}</div>
								</div>

								<div className="ldm-detail-row">
									<div className="ldm-detail-label">
										<FontAwesomeIcon
											icon={faSchool}
											className="ldm-detail-icon"
										/>
										Class
									</div>
									<div className="ldm-detail-value">{departmentName}</div>
								</div>
							</>
						)}
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
