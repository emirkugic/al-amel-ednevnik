import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChalkboardTeacher,
	faLayerGroup,
	faTimes,
	faSearch,
	faExclamationCircle,
	faCalendar,
	faClock,
} from "@fortawesome/free-solid-svg-icons";
import studentApi from "../../api/studentApi";
import classLogApi from "../../api/classLogApi";
import useAuth from "../../hooks/useAuth";
import { CLASS_PERIODS } from "../../constants";
import { useLanguage } from "../../contexts/LanguageContext";
import "./EditLogModal.css";

const EditLogModal = ({ log, onClose, handleUpdateLog }) => {
	const { user } = useAuth();
	const { t, language } = useLanguage();
	const [lectureTitle, setLectureTitle] = useState(log.lectureTitle || "");
	const [sequence, setSequence] = useState(
		log.sequence ? log.sequence.toString() : "1"
	);
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentOptions, setStudentOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [notification, setNotification] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	// Add states for day and period
	const [selectedDay, setSelectedDay] = useState("");
	const [period, setPeriod] = useState(log.period ? log.period.toString() : "");

	// Generate weekdays based on the log's date
	const weekDays = useMemo(() => {
		const dayNames = [
			t("days.fullNames.monday"),
			t("days.fullNames.tuesday"),
			t("days.fullNames.wednesday"),
			t("days.fullNames.thursday"),
			t("days.fullNames.friday"),
		];

		// Use the log's date to find the Monday of that week
		const logDate = new Date(log.classDate);
		const dayOfWeek = logDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

		// Calculate how many days to go back to reach Monday
		const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

		// Get Monday's date
		const mondayDate = new Date(logDate);
		mondayDate.setDate(logDate.getDate() - daysFromMonday);

		// Generate array of weekdays
		return dayNames.map((name, index) => {
			const date = new Date(mondayDate);
			date.setDate(mondayDate.getDate() + index);

			// Use appropriate locale based on current language
			const locale =
				language === "ar" ? "ar-SA" : language === "bs" ? "bs-BA" : "en-US";

			return {
				value: date.toISOString().split("T")[0], // Format as YYYY-MM-DD
				label: `${name} (${date.toLocaleDateString(locale, {
					month: "short",
					day: "numeric",
				})})`,
				date: date,
			};
		});
	}, [log.classDate, t, language]);

	// Initialize day based on classDate from log
	useEffect(() => {
		if (log.classDate) {
			// Use the log's date directly
			const formattedDate = new Date(log.classDate).toISOString().split("T")[0];
			setSelectedDay(formattedDate);
		}
	}, [log.classDate]);

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
				setNotification(t("editLogModal.errorFetchingStudents"));
			}
		};

		fetchStudents();
	}, [log.departmentId, user.token, log.absentStudents, t]);

	const handleSubmit = async () => {
		if (!lectureTitle.trim()) {
			setNotification(t("editLogModal.pleaseEnterTitle"));
			return;
		}

		if (!selectedDay) {
			setNotification(t("editLogModal.pleaseSelectDay"));
			return;
		}

		if (!period) {
			setNotification(t("editLogModal.pleaseSelectPeriod"));
			return;
		}

		// Prepare the updated log data
		const updatedLog = {
			lectureTitle,
			lectureType: log.lectureType || "Lecture",
			classDate: selectedDay, // Use the selected day
			period: period, // Use the selected period
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
			setNotification(t("editLogModal.errorUpdatingLog"));
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
						<h2>{t("editLogModal.title")}</h2>
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
								<h3>{t("editLogModal.classInfo")}</h3>
							</div>

							<div className="elm-form-fields">
								{/* Day of the Week Selector */}
								<div className="elm-form-group">
									<label>
										<FontAwesomeIcon
											icon={faCalendar}
											className="elm-field-icon"
										/>
										{t("editLogModal.dayOfWeek")}
									</label>
									<select
										className="elm-select"
										value={selectedDay}
										onChange={(e) => setSelectedDay(e.target.value)}
									>
										<option value="">{t("editLogModal.selectDay")}</option>
										{weekDays.map((day) => (
											<option key={day.value} value={day.value}>
												{day.label}
											</option>
										))}
									</select>
								</div>

								{/* Period Selector */}
								<div className="elm-form-group">
									<label>
										<FontAwesomeIcon
											icon={faClock}
											className="elm-field-icon"
										/>
										{t("editLogModal.period")}
									</label>
									<select
										className="elm-select"
										value={period}
										onChange={(e) => setPeriod(e.target.value)}
									>
										<option value="">{t("editLogModal.selectPeriod")}</option>
										{CLASS_PERIODS.map((period) => {
											// Map numeric values to their ordinal names for translation
											const periodNameMap = {
												1: "first",
												2: "second",
												3: "third",
												4: "fourth",
												5: "fifth",
												6: "sixth",
												7: "seventh",
											};

											// Use the mapping or fallback to the original value
											const translationKey =
												periodNameMap[period.value] ||
												period.translationKey ||
												"first";

											return (
												<option key={period.value} value={period.value}>
													{t(`timetable.periods.${translationKey}`)}
												</option>
											);
										})}
									</select>
								</div>

								<div className="elm-form-group">
									<label>
										<FontAwesomeIcon
											icon={faChalkboardTeacher}
											className="elm-field-icon"
										/>
										{t("editLogModal.lectureTitle")}
									</label>
									<input
										type="text"
										className="elm-text-input"
										placeholder={t("editLogModal.lecturePlaceholder")}
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
										{t("editLogModal.sequenceNumber")}
									</label>
									<input
										type="text"
										className="elm-text-input"
										placeholder={t("editLogModal.sequencePlaceholder")}
										value={sequence}
										onChange={(e) => setSequence(e.target.value)}
									/>
								</div>

								{/* Attendance summary for mobile only */}
								<div className="elm-mobile-only">
									<div className="elm-summary">
										<div className="elm-attendance-summary">
											<h4>{t("editLogModal.attendanceSummary")}</h4>
											<div className="elm-summary-stats">
												<div className="elm-stat">
													<span className="elm-stat-label">
														{t("editLogModal.present")}
													</span>
													<span className="elm-stat-value">
														{studentOptions.length - absentStudents.length}
													</span>
												</div>
												<div className="elm-stat">
													<span className="elm-stat-label">
														{t("editLogModal.absent")}
													</span>
													<span className="elm-stat-value elm-absent-count">
														{absentStudents.length}
													</span>
												</div>
												<div className="elm-stat">
													<span className="elm-stat-label">
														{t("editLogModal.total")}
													</span>
													<span className="elm-stat-value">
														{studentOptions.length}
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right column - Student Attendance */}
						<div className="elm-attendance-column">
							<div className="elm-section-header">
								<h3>{t("editLogModal.studentAttendance")}</h3>
							</div>

							<div className="elm-student-search">
								<FontAwesomeIcon icon={faSearch} className="elm-search-icon" />
								<input
									type="text"
									className="elm-search-input"
									placeholder={t("editLogModal.searchStudents")}
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
														? t("editLogModal.absentStatus")
														: t("editLogModal.presentStatus")}
												</span>
											</label>
										</div>
									))
								) : (
									<div className="elm-no-results">
										<p>{t("editLogModal.noStudentsFound")}</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Footer with attendance summary and action buttons */}
					<div className="elm-modal-footer">
						<div className="elm-footer-left elm-desktop-only">
							<div className="elm-attendance-summary">
								<div className="elm-summary-stats">
									<div className="elm-stat">
										<span className="elm-stat-label">
											{t("editLogModal.present")}
										</span>
										<span className="elm-stat-value">
											{studentOptions.length - absentStudents.length}
										</span>
									</div>
									<div className="elm-stat">
										<span className="elm-stat-label">
											{t("editLogModal.absent")}
										</span>
										<span className="elm-stat-value elm-absent-count">
											{absentStudents.length}
										</span>
									</div>
									<div className="elm-stat">
										<span className="elm-stat-label">
											{t("editLogModal.total")}
										</span>
										<span className="elm-stat-value">
											{studentOptions.length}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="elm-footer-right">
							<button
								className="elm-cancel-button"
								onClick={onClose}
								disabled={isLoading}
							>
								{t("editLogModal.cancel")}
							</button>
							<button
								className="elm-submit-button"
								onClick={handleSubmit}
								disabled={isLoading}
							>
								{isLoading
									? t("editLogModal.saving")
									: t("editLogModal.saveChanges")}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditLogModal;
