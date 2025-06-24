import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faEdit } from "@fortawesome/free-solid-svg-icons";
import "./Absences.css";
import ExcuseModal from "./Absences/ExcuseModal";
import { useAbsences, useAuth, useClassTeacher } from "../../../hooks";
import { useLanguage } from "../../../contexts/LanguageContext";

const tempDepartmentId = "673b94896d216a12b56d0c17";

const getWeekNumber = (dateString) => {
	const date = new Date(dateString);
	let schoolYear = date.getFullYear();
	if (date.getMonth() < 8) {
		schoolYear -= 1;
	}
	const sept1 = new Date(schoolYear, 8, 1);
	const offset = (1 - sept1.getDay() + 7) % 7;
	const schoolStart = new Date(sept1);
	schoolStart.setDate(sept1.getDate() + offset);
	const winterStart = new Date(schoolYear + 1, 0, 1);
	const winterEnd = new Date(schoolYear + 1, 0, 28);
	const daysBetween = (d1, d2) => Math.floor((d2 - d1) / 86400000);

	let dateDays = daysBetween(schoolStart, date);
	let breakDays = 0;

	if (date >= winterEnd) {
		breakDays = daysBetween(winterStart, winterEnd) + 1;
	} else if (date >= winterStart && date <= winterEnd) {
		dateDays = daysBetween(schoolStart, winterStart);
	}

	const effectiveDays = dateDays - breakDays;
	if (effectiveDays < 0) return 0;
	return Math.floor(effectiveDays / 7) + 1;
};

const Absences = ({ departmentId: propDepartmentId }) => {
	const { user } = useAuth();
	const token = user?.token;
	const { t, language } = useLanguage();

	// Get the department id for class teachers using our custom hook.
	const classTeacherDeptId = useClassTeacher();
	const departmentId =
		propDepartmentId || classTeacherDeptId || tempDepartmentId;

	// Use the departmentId in our absences hook.
	const { absences, loading, error, updateAbsence } = useAbsences(
		departmentId,
		token
	);

	// Local state for UI updates.
	const [localAbsences, setLocalAbsences] = useState([]);

	// Reset localAbsences when departmentId changes
	useEffect(() => {
		setLocalAbsences([]);
	}, [departmentId]);

	useEffect(() => {
		if (!loading && absences) {
			setLocalAbsences(absences);
		}
	}, [absences, loading]);

	const absencesByWeek = useMemo(() => {
		const grouped = {};
		for (const record of localAbsences) {
			const { absence, student, classLog } = record;
			const rawDate = classLog.classDate;
			const dateObj = new Date(rawDate);
			const dateStr = dateObj.toISOString().split("T")[0];

			// Formatted week label based on language
			const weekNumber = getWeekNumber(dateStr);
			let weekLabel;

			// Format week label with explicit number formatting for Arabic
			if (language === "ar") {
				// Convert number to Arabic numerals
				const arabicNumerals = [
					"٠",
					"١",
					"٢",
					"٣",
					"٤",
					"٥",
					"٦",
					"٧",
					"٨",
					"٩",
				];
				const weekNumberStr = weekNumber
					.toString()
					.split("")
					.map((digit) => arabicNumerals[parseInt(digit)])
					.join("");
				weekLabel = `الأسبوع ${weekNumberStr}`;
			} else {
				weekLabel = t("absences.weekLabel", { number: weekNumber });
			}

			const studentId = student.id;
			const studentName = `${student.firstName} ${student.lastName}`.trim();
			const periodNumber = parseInt(classLog.period, 10) || 1;

			if (!grouped[weekLabel]) grouped[weekLabel] = {};
			if (!grouped[weekLabel][dateStr]) grouped[weekLabel][dateStr] = {};
			if (!grouped[weekLabel][dateStr][studentId]) {
				grouped[weekLabel][dateStr][studentId] = { studentName, periods: [] };
			}

			grouped[weekLabel][dateStr][studentId].periods.push({
				absenceId: absence.id,
				number: periodNumber,
				resolved: !!absence.isExcused,
				reason: absence.reason || "",
			});
		}
		return grouped;
	}, [localAbsences, t, language]); // Added t as dependency

	const [periodModal, setPeriodModal] = useState({
		open: false,
		absenceId: null,
		date: "",
		studentId: null,
		periodNumber: null,
		currentReason: "",
	});

	const openPeriodExcuseModal = (
		absenceId,
		date,
		studentId,
		periodNumber,
		currentReason
	) => {
		setPeriodModal({
			open: true,
			absenceId,
			date,
			studentId,
			periodNumber,
			currentReason: currentReason || "",
		});
	};

	const openStudentDayExcuseModal = (studentId, date) => {
		setPeriodModal({
			open: true,
			absenceId: null,
			date,
			studentId,
			periodNumber: null,
			currentReason: "",
		});
	};

	const savePeriodExcuse = async () => {
		const { absenceId, currentReason, studentId, date, periodNumber } =
			periodModal;
		if (!currentReason.trim()) return;

		let updatedAbsences;
		if (periodNumber !== null) {
			// Single period update
			updatedAbsences = localAbsences.map((rec) => {
				if (rec.absence.id === absenceId) {
					return {
						...rec,
						absence: {
							...rec.absence,
							isExcused: true,
							reason: currentReason,
						},
					};
				}
				return rec;
			});
			setLocalAbsences(updatedAbsences);

			try {
				await updateAbsence(absenceId, true, currentReason);
			} catch (err) {
				console.error("Failed to update single absence:", err);
				setLocalAbsences((prev) => [...absences]); // revert
			}
		} else {
			// Excuse all periods for the day
			const toUpdate = localAbsences.filter((rec) => {
				const recDate = new Date(rec.classLog.classDate)
					.toISOString()
					.split("T")[0];
				return rec.student.id === studentId && recDate === date;
			});

			updatedAbsences = localAbsences.map((rec) => {
				const recDate = new Date(rec.classLog.classDate)
					.toISOString()
					.split("T")[0];
				if (rec.student.id === studentId && recDate === date) {
					return {
						...rec,
						absence: {
							...rec.absence,
							isExcused: true,
							reason: currentReason,
						},
					};
				}
				return rec;
			});
			setLocalAbsences(updatedAbsences);

			for (const rec of toUpdate) {
				try {
					await updateAbsence(rec.absence.id, true, currentReason);
				} catch (err) {
					console.error("Failed to update daily absence:", err);
					setLocalAbsences((prev) => [...absences]); // revert
					break;
				}
			}
		}

		setPeriodModal({ ...periodModal, open: false });
	};

	// Format date string according to locale
	const formatDate = (dateStr) => {
		const dateObj = new Date(dateStr);

		if (language === "ar") {
			// For Arabic, use the appropriate locale but without Hijri calendar
			// This prevents getting dates like "٢٨‏/٧‏/١٤٤٦ هـ"
			try {
				// Use a simpler format for Arabic with Gregorian calendar
				return dateObj.toLocaleDateString("ar", {
					year: "numeric",
					month: "numeric",
					day: "numeric",
				});
			} catch (error) {
				// Fallback for compatibility
				return dateStr;
			}
		} else if (language === "bs") {
			// For Bosnian, use the appropriate format
			return dateObj.toLocaleDateString("bs-BA", {
				year: "numeric",
				month: "numeric",
				day: "numeric",
			});
		} else {
			// Default to ISO format
			return dateStr;
		}
	};

	// Format period number according to language
	const formatPeriodNumber = (number) => {
		if (language === "ar") {
			// Convert to Arabic numerals
			const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
			return "ح" + arabicNumerals[number];
		} else if (language === "bs") {
			return "Č" + number;
		} else {
			return "P" + number;
		}
	};

	if (loading) return <div className="loading">{t("absences.loading")}</div>;
	if (error)
		return (
			<div className="error">
				{t("absences.error")}: {error}
			</div>
		);

	return (
		<div className="absences-container">
			{Object.keys(absencesByWeek).length === 0 ? (
				<p className="no-data">{t("absences.noData")}</p>
			) : (
				Object.entries(absencesByWeek).map(([week, days]) => (
					<div key={week} className="week-group">
						<h3 className="week-title">{week}</h3>
						{Object.entries(days).map(([dateStr, studentsObj]) => {
							const dateObj = new Date(dateStr);
							const isFriday = dateObj.getDay() === 5;
							const totalPeriods = isFriday ? 5 : 7;
							const displayDate = formatDate(dateStr);

							return (
								<div key={dateStr} className="day-card">
									<div className="day-card-header">
										<h4>{displayDate}</h4>
									</div>
									<table className="absences-table">
										<thead>
											<tr>
												<th>{t("absences.student")}</th>
												{Array.from({ length: totalPeriods }, (_, i) => (
													<th key={i}>{formatPeriodNumber(i + 1)}</th>
												))}
												<th>{t("absences.actions")}</th>
											</tr>
										</thead>
										<tbody>
											{Object.entries(studentsObj).map(([stId, stData]) => {
												const { studentName, periods } = stData;
												return (
													<tr key={stId}>
														<td
															className="student-name-cell"
															title={studentName}
														>
															{studentName}
														</td>
														{Array.from({ length: totalPeriods }, (_, idx) => {
															const periodRecord = periods.find(
																(p) => p.number === idx + 1
															);
															if (!periodRecord) {
																return (
																	<td key={idx} className="present-cell">
																		✓
																	</td>
																);
															}
															const { absenceId, resolved, reason } =
																periodRecord;
															const cellClass = resolved
																? "cell-resolved"
																: "cell-unresolved";
															return (
																<td key={idx} className={cellClass}>
																	<div
																		className="cell-icon"
																		onClick={() =>
																			openPeriodExcuseModal(
																				absenceId,
																				dateStr,
																				stId,
																				idx + 1,
																				reason
																			)
																		}
																		title={
																			reason
																				? t("absences.reasonTitle", { reason })
																				: t("absences.clickToExcuse")
																		}
																	>
																		{resolved ? (
																			<FontAwesomeIcon icon={faCheck} />
																		) : (
																			<FontAwesomeIcon icon={faTimes} />
																		)}
																	</div>
																</td>
															);
														})}
														<td>
															<button
																className="toggle-student-day-btn"
																onClick={() =>
																	openStudentDayExcuseModal(stId, dateStr)
																}
															>
																<FontAwesomeIcon icon={faEdit} />
																<span>{t("absences.excuseDay")}</span>
															</button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							);
						})}
					</div>
				))
			)}
			<ExcuseModal
				open={periodModal.open}
				title={
					periodModal.periodNumber !== null
						? t("absences.excuseThisAbsence")
						: t("absences.excuseAllAbsences", {
								date: formatDate(periodModal.date),
						  })
				}
				reason={periodModal.currentReason}
				onChange={(e) =>
					setPeriodModal({ ...periodModal, currentReason: e.target.value })
				}
				onCancel={() => setPeriodModal({ ...periodModal, open: false })}
				onSave={savePeriodExcuse}
				disabled={!periodModal.currentReason.trim()}
			/>
		</div>
	);
};

export default Absences;
