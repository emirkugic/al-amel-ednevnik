import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChalkboardTeacher,
	faLayerGroup,
	faTimes,
	faSearch,
	faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import studentApi from "../../api/studentApi";
import classLogApi from "../../api/classLogApi";
import useAuth from "../../hooks/useAuth";
import "./EditLogModal.css";

const EditLogModal = ({ log, onClose, handleUpdateLog }) => {
	const { user } = useAuth();
	const [lectureTitle, setLectureTitle] = useState(log.lectureTitle || "");
	const [sequence, setSequence] = useState(
		log.sequence ? log.sequence.toString() : "1"
	);
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentOptions, setStudentOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [notification, setNotification] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		if (!log.departmentId) return;

		const fetchStudents = async () => {
			try {
				const students = await studentApi.getStudentsByDepartment(
					log.departmentId,
					user.token
				);

				// Format students for the dropdown
				const formattedStudents = students.map((student) => ({
					value: student.id,
					label: `${student.firstName} ${student.lastName}`,
				}));

				setStudentOptions(formattedStudents);

				// Format absent students to match the dropdown options
				const formattedAbsent = log.absentStudents
					.map((absent) =>
						formattedStudents.find(
							(student) => student.value === absent.studentId
						)
					)
					.filter(Boolean); // Remove unmatched students

				setAbsentStudents(formattedAbsent);
			} catch (error) {
				console.error("Error fetching students:", error);
				setNotification("Error fetching students. Please try again.");
			}
		};

		fetchStudents();
	}, [log.departmentId, user.token, log.absentStudents]);

	const handleSubmit = async () => {
		if (!lectureTitle.trim()) {
			setNotification("Please enter a lecture title.");
			return;
		}

		// Prepare the updated log data; parse the sequence from state.
		const updatedLog = {
			lectureTitle,
			lectureType: log.lectureType || "Lecture",
			classDate: log.classDate,
			period: log.period,
			sequence: parseInt(sequence, 10) || 1,
			absentStudentIds: absentStudents.map((s) => s.value),
		};

		setIsLoading(true);
		try {
			await classLogApi.updateClassLog(log.classLogId, updatedLog, user.token);

			// Pass along the updated absent students so that the DataTable reflects the change
			handleUpdateLog({
				...log,
				...updatedLog,
				absentStudents: absentStudents.map((item) => ({
					studentId: item.value,
					name: item.label,
				})),
			});

			onClose();
		} catch (error) {
			console.error("Error updating log:", error);
			setNotification("Error updating log. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Filter students based on search term
	const filteredStudents = studentOptions.filter((student) =>
		student.label.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Check if a student is marked as absent
	const isStudentAbsent = (studentId) => {
		return absentStudents.some((s) => s.value === studentId);
	};

	// Toggle a student's absence status
	const toggleStudentAbsence = (student) => {
		if (isStudentAbsent(student.value)) {
			setAbsentStudents(
				absentStudents.filter((s) => s.value !== student.value)
			);
		} else {
			setAbsentStudents([...absentStudents, student]);
		}
	};

	return (
		<div className="elm-modal-overlay">
			<div className="elm-modal-container">
				<div className="elm-modal-content">
					{/* Header with title and close button */}
					<div className="elm-modal-header">
						<h2>Edit Class Log</h2>
						<button className="elm-close-button" onClick={onClose}>
							<FontAwesomeIcon icon={faTimes} />
						</button>
					</div>

					{/* Loading indicator */}
					{isLoading && <div className="elm-loading-indicator"></div>}

					{/* Notification display */}
					{notification && (
						<div className="elm-notifications">
							<div className="elm-notification elm-notification-error">
								<FontAwesomeIcon icon={faExclamationCircle} />
								<span>{notification}</span>
								<button onClick={() => setNotification("")}>
									<FontAwesomeIcon icon={faTimes} />
								</button>
							</div>
						</div>
					)}

					{/* Two-column layout */}
					<div className="elm-modal-body">
						{/* Left column - Log Information */}
						<div className="elm-class-info-column">
							<div className="elm-section-header">
								<h3>Class Information</h3>
							</div>

							<div className="elm-form-fields">
								<div className="elm-form-group">
									<label>
										<FontAwesomeIcon
											icon={faChalkboardTeacher}
											className="elm-field-icon"
										/>
										Lecture Title
									</label>
									<input
										type="text"
										className="elm-text-input"
										placeholder="Enter lecture title"
										value={lectureTitle}
										onChange={(e) => setLectureTitle(e.target.value)}
									/>
								</div>

								<div className="elm-form-group">
									<label>
										<FontAwesomeIcon
											icon={faLayerGroup}
											className="elm-field-icon"
										/>
										Sequence Number
									</label>
									<input
										type="text"
										className="elm-text-input"
										placeholder="Enter sequence number"
										value={sequence}
										onChange={(e) => setSequence(e.target.value)}
									/>
								</div>

								<div className="elm-summary">
									<div className="elm-attendance-summary">
										<h4>Attendance Summary</h4>
										<div className="elm-summary-stats">
											<div className="elm-stat">
												<span className="elm-stat-label">Present:</span>
												<span className="elm-stat-value">
													{studentOptions.length - absentStudents.length}
												</span>
											</div>
											<div className="elm-stat">
												<span className="elm-stat-label">Absent:</span>
												<span className="elm-stat-value elm-absent-count">
													{absentStudents.length}
												</span>
											</div>
											<div className="elm-stat">
												<span className="elm-stat-label">Total:</span>
												<span className="elm-stat-value">
													{studentOptions.length}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right column - Student Attendance */}
						<div className="elm-attendance-column">
							<div className="elm-section-header">
								<h3>Student Attendance</h3>
							</div>

							<div className="elm-student-search">
								<FontAwesomeIcon icon={faSearch} className="elm-search-icon" />
								<input
									type="text"
									className="elm-search-input"
									placeholder="Search students..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="elm-students-list">
								{filteredStudents.length > 0 ? (
									filteredStudents.map((student) => (
										<div
											key={student.value}
											className={`elm-student-item ${
												isStudentAbsent(student.value)
													? "elm-absent"
													: "elm-present"
											}`}
										>
											<span className="elm-student-name">{student.label}</span>
											<label className="elm-toggle-switch">
												<input
													type="checkbox"
													checked={isStudentAbsent(student.value)}
													onChange={() => toggleStudentAbsence(student)}
												/>
												<span className="elm-toggle-slider"></span>
												<span className="elm-status-label">
													{isStudentAbsent(student.value)
														? "Absent"
														: "Present"}
												</span>
											</label>
										</div>
									))
								) : (
									<div className="elm-no-results">
										<p>No students found matching your search criteria.</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Footer with action buttons */}
					<div className="elm-modal-footer">
						<button
							className="elm-cancel-button"
							onClick={onClose}
							disabled={isLoading}
						>
							Cancel
						</button>
						<button
							className="elm-submit-button"
							onClick={handleSubmit}
							disabled={isLoading}
						>
							{isLoading ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditLogModal;
