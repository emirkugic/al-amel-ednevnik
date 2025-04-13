// src/pages/AttendancePage/components/AttendanceExcuseModal.js
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTimes,
	faCheck,
	faCalendarAlt,
	faBook,
	faUserGraduate,
	faClock,
	faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import "./AttendanceExcuseModal.css";

const AttendanceExcuseModal = ({ absence, onClose, onSave }) => {
	const { t } = useLanguage();

	const [isExcused, setIsExcused] = useState(absence.absence.isExcused);
	const [reason, setReason] = useState(absence.absence.reason || "");

	// Format date for display
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSave(isExcused, reason);
	};

	return (
		<div className="attendance-excuse-modal-backdrop">
			<div className="attendance-excuse-modal-container">
				<header className="attendance-excuse-modal-header">
					<h2>
						{isExcused
							? t("attendance.editExcuse", "Edit Excuse")
							: t("attendance.excuseAbsence", "Excuse Absence")}
					</h2>
					<button
						className="attendance-excuse-modal-close-button"
						onClick={onClose}
					>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</header>

				<div className="attendance-excuse-modal-body">
					<div className="attendance-excuse-absence-details">
						<div className="attendance-excuse-detail-item">
							<FontAwesomeIcon
								icon={faUserGraduate}
								className="attendance-excuse-detail-icon"
							/>
							<div className="attendance-excuse-detail-content">
								<label>{t("attendance.student", "Student")}</label>
								<span>
									{absence.student
										? `${absence.student.firstName} ${absence.student.lastName}`
										: t("attendance.unknownStudent", "Unknown Student")}
								</span>
							</div>
						</div>

						<div className="attendance-excuse-detail-item">
							<FontAwesomeIcon
								icon={faCalendarAlt}
								className="attendance-excuse-detail-icon"
							/>
							<div className="attendance-excuse-detail-content">
								<label>{t("attendance.date", "Date")}</label>
								<span>{formatDate(absence.classLog.classDate)}</span>
							</div>
						</div>

						<div className="attendance-excuse-detail-item">
							<FontAwesomeIcon
								icon={faClock}
								className="attendance-excuse-detail-icon"
							/>
							<div className="attendance-excuse-detail-content">
								<label>{t("attendance.period", "Period")}</label>
								<span>
									{t("attendance.periodNumber", "Period")}{" "}
									{absence.classLog.period}
								</span>
							</div>
						</div>

						<div className="attendance-excuse-detail-item">
							<FontAwesomeIcon
								icon={faBook}
								className="attendance-excuse-detail-icon"
							/>
							<div className="attendance-excuse-detail-content">
								<label>{t("attendance.subject", "Subject")}</label>
								<span>
									{absence.classLog.subjectName ||
										t("attendance.unknownSubject", "Unknown Subject")}
								</span>
							</div>
						</div>

						<div className="attendance-excuse-detail-item">
							<FontAwesomeIcon
								icon={faInfoCircle}
								className="attendance-excuse-detail-icon"
							/>
							<div className="attendance-excuse-detail-content">
								<label>{t("attendance.lectureTitle", "Lecture")}</label>
								<span>{absence.classLog.lectureTitle}</span>
							</div>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="attendance-excuse-form">
						<div className="attendance-excuse-toggle">
							<span className="attendance-excuse-toggle-label">
								{t("attendance.excuseStatus", "Excuse Status")}
							</span>
							<label className="attendance-excuse-switch">
								<input
									type="checkbox"
									checked={isExcused}
									onChange={() => setIsExcused(!isExcused)}
								/>
								<span className="attendance-excuse-slider"></span>
								<span className="attendance-excuse-status-label">
									{isExcused
										? t("attendance.excused", "Excused")
										: t("attendance.unexcused", "Unexcused")}
								</span>
							</label>
						</div>

						<div className="attendance-excuse-reason-field">
							<label htmlFor="reason">{t("attendance.reason", "Reason")}</label>
							<textarea
								id="reason"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								placeholder={t(
									"attendance.enterReason",
									"Enter reason for absence..."
								)}
								rows={4}
							></textarea>
							<p className="attendance-excuse-reason-help">
								{isExcused
									? t(
											"attendance.reasonRequired",
											"Please provide a reason for excusing this absence"
									  )
									: t(
											"attendance.reasonOptional",
											"Reason is optional for unexcused absences"
									  )}
							</p>
						</div>
					</form>
				</div>

				<footer className="attendance-excuse-modal-footer">
					<button className="attendance-excuse-cancel-button" onClick={onClose}>
						{t("attendance.cancel", "Cancel")}
					</button>
					<button
						className="attendance-excuse-save-button"
						onClick={handleSubmit}
						disabled={isExcused && !reason.trim()}
					>
						<FontAwesomeIcon icon={faCheck} />{" "}
						{t("attendance.saveChanges", "Save Changes")}
					</button>
				</footer>
			</div>
		</div>
	);
};

export default AttendanceExcuseModal;
