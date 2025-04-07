import React, { useState } from "react";
import {
	faClock,
	faChalkboardTeacher,
	faCalendar,
	faBook,
	faTimes,
	faSearch,
	faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CLASS_PERIODS } from "../../constants";
import { useClassLogForm } from "./hooks/useClassLogForm";
import { useLanguage } from "../../contexts/LanguageContext";
import "./ClassLogFormModal.css";

const ClassLogFormModal = ({
	onClose,
	departmentId,
	subjectId,
	disableDayAndPeriodSelection = false,
	externalDate,
	externalPeriod,
	subjects = [],
	onSuccess,
}) => {
	const { t } = useLanguage();
	const {
		isNewUiMode,
		weekDays,
		selectedDay,
		setSelectedDay,
		classHour,
		setClassHour,
		lectureTitle,
		setLectureTitle,
		classSequence,
		setClassSequence,
		absentStudents,
		setAbsentStudents,
		studentOptions,
		isLoading,
		teacherSubjects,
		selectedSubject,
		setSelectedSubject,
		notifications,
		removeNotification,
		handleSubmit,
	} = useClassLogForm({
		onClose,
		departmentId,
		subjectId,
		disableDayAndPeriodSelection,
		externalDate,
		externalPeriod,
		subjects,
		onSuccess,
	});

	// Additional state for student filtering
	const [searchTerm, setSearchTerm] = useState("");

	// Filter students based on search term AND sort alphabetically by name
	const filteredStudents = studentOptions
		.filter((student) =>
			student.label.toLowerCase().includes(searchTerm.toLowerCase())
		)
		.sort((a, b) => a.label.localeCompare(b.label));

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
		<div className="clm-modal-overlay">
			<div className="clm-modal-container">
				<div className="clm-modal-content">
					{/* Header with title and close button */}
					<div className="clm-modal-header">
						<h2>{t("classLogForm.logClass")}</h2>
						<button className="clm-close-button" onClick={onClose}>
							<FontAwesomeIcon icon={faTimes} />
						</button>
					</div>

					{/* Notification display */}
					{notifications.length > 0 && (
						<div className="clm-notifications">
							{notifications.map((note) => (
								<div
									key={note.id}
									className={`clm-notification clm-notification-${note.type}`}
								>
									<FontAwesomeIcon icon={faExclamationCircle} />
									<span>{note.description}</span>
									<button onClick={() => removeNotification(note.id)}>
										<FontAwesomeIcon icon={faTimes} />
									</button>
								</div>
							))}
						</div>
					)}

					{/* Loading indicator */}
					{isLoading && <div className="clm-loading-indicator"></div>}

					{/* Two-column layout */}
					<div className="clm-modal-body">
						{/* Left column - Class Information */}
						<div className="clm-class-info-column">
							<div className="clm-section-header">
								<h3>{t("classLogForm.classInfo")}</h3>
							</div>

							<div className="clm-form-fields">
								{!isNewUiMode && (
									<>
										<div className="clm-form-group">
											<label>
												<FontAwesomeIcon
													icon={faCalendar}
													className="clm-field-icon"
												/>
												{t("classLogForm.dayOfWeek")}
											</label>
											<select
												className="clm-select"
												value={selectedDay}
												onChange={(e) => setSelectedDay(e.target.value)}
											>
												<option value="">{t("classLogForm.selectDay")}</option>
												{weekDays.map((day) => (
													<option key={day.value} value={day.value}>
														{day.label}
													</option>
												))}
											</select>
										</div>

										<div className="clm-form-group">
											<label>
												<FontAwesomeIcon
													icon={faClock}
													className="clm-field-icon"
												/>
												{t("classLogForm.period")}
											</label>
											<select
												className="clm-select"
												value={classHour}
												onChange={(e) => setClassHour(e.target.value)}
											>
												<option value="">
													{t("classLogForm.selectPeriod")}
												</option>
												{CLASS_PERIODS.map((period) => (
													<option key={period.value} value={period.value}>
														{period.label}
													</option>
												))}
											</select>
										</div>
									</>
								)}

								{isNewUiMode && (
									<div className="clm-form-group">
										<label>
											<FontAwesomeIcon
												icon={faBook}
												className="clm-field-icon"
											/>
											{t("classLogForm.subject")}
										</label>
										<select
											className="clm-select"
											value={selectedSubject}
											onChange={(e) => setSelectedSubject(e.target.value)}
										>
											<option value="">
												{t("classLogForm.selectSubject")}
											</option>
											{teacherSubjects.map((subject) => (
												<option key={subject.value} value={subject.value}>
													{subject.label}
												</option>
											))}
										</select>
									</div>
								)}

								<div className="clm-form-group">
									<label>
										<FontAwesomeIcon
											icon={faChalkboardTeacher}
											className="clm-field-icon"
										/>
										{t("classLogForm.lectureTitle")}
									</label>
									<input
										type="text"
										className="clm-text-input"
										placeholder={t("classLogForm.lecturePlaceholder")}
										value={lectureTitle}
										onChange={(e) => setLectureTitle(e.target.value)}
									/>
								</div>

								<div className="clm-summary">
									<div className="clm-attendance-summary">
										<h4>{t("classLogForm.attendanceSummary")}</h4>
										<div className="clm-summary-stats">
											<div className="clm-stat">
												<span className="clm-stat-label">
													{t("classLogForm.present")}
												</span>
												<span className="clm-stat-value">
													{studentOptions.length - absentStudents.length}
												</span>
											</div>
											<div className="clm-stat">
												<span className="clm-stat-label">
													{t("classLogForm.absent")}
												</span>
												<span className="clm-stat-value clm-absent-count">
													{absentStudents.length}
												</span>
											</div>
											<div className="clm-stat">
												<span className="clm-stat-label">
													{t("classLogForm.total")}
												</span>
												<span className="clm-stat-value">
													{studentOptions.length}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right column - Student Attendance */}
						<div className="clm-attendance-column">
							<div className="clm-section-header">
								<h3>{t("classLogForm.studentAttendance")}</h3>
							</div>

							<div className="clm-student-search">
								<FontAwesomeIcon icon={faSearch} className="clm-search-icon" />
								<input
									type="text"
									className="clm-search-input"
									placeholder={t("classLogForm.searchStudents")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="clm-students-list">
								{filteredStudents.length > 0 ? (
									filteredStudents.map((student) => (
										<div
											key={student.value}
											className={`clm-student-item ${
												isStudentAbsent(student.value)
													? "clm-absent"
													: "clm-present"
											}`}
										>
											<span className="clm-student-name">{student.label}</span>
											<label className="clm-toggle-switch">
												<input
													type="checkbox"
													checked={isStudentAbsent(student.value)}
													onChange={() => toggleStudentAbsence(student)}
												/>
												<span className="clm-toggle-slider"></span>
												<span className="clm-status-label">
													{isStudentAbsent(student.value)
														? t("classLogForm.absentStatus")
														: t("classLogForm.presentStatus")}
												</span>
											</label>
										</div>
									))
								) : (
									<div className="clm-no-results">
										<p>{t("classLogForm.noStudentsFound")}</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Footer with action buttons */}
					<div className="clm-modal-footer">
						<button
							className="clm-cancel-button"
							onClick={onClose}
							disabled={isLoading}
						>
							{t("classLogForm.cancel")}
						</button>
						<button
							className="clm-submit-button"
							onClick={handleSubmit}
							disabled={isLoading}
						>
							{isLoading
								? t("classLogForm.saving")
								: t("classLogForm.logClass")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ClassLogFormModal;
