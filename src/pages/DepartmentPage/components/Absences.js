import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faEdit } from "@fortawesome/free-solid-svg-icons";

import "./Absences.css";
import ExcuseModal from "./Absences/ExcuseModal";
import { useAbsences, useAuth } from "../../../hooks";

const tempDepartmentId = "673b94896d216a12b56d0c17";

const getWeekNumber = (dateString) => {
	const date = new Date(dateString);
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
	return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const Absences = () => {
	const { user } = useAuth();
	const token = user?.token;
	const { absences, loading, error } = useAbsences(tempDepartmentId, token);
	const [localAbsences, setLocalAbsences] = useState([]);

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
			const weekLabel = `Week ${getWeekNumber(dateStr)}`;
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
	}, [localAbsences]);

	// Modal state for both individual period excuse and for excusing an entire student's day.
	// When periodNumber is null, it indicates a bulk update (excusing the entire day for that student).
	const [periodModal, setPeriodModal] = useState({
		open: false,
		absenceId: null,
		date: "",
		studentId: null,
		periodNumber: null,
		currentReason: "",
	});

	// Open modal for an individual period
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

	// Open modal for excusing the entire day for one student
	const openStudentDayExcuseModal = (studentId, date) => {
		setPeriodModal({
			open: true,
			absenceId: null,
			date,
			studentId,
			periodNumber: null, // indicates bulk update
			currentReason: "",
		});
	};

	// Save the excuse. If periodNumber is null, update every absence for that student on that date.
	const savePeriodExcuse = () => {
		const { absenceId, currentReason, studentId, date, periodNumber } =
			periodModal;
		if (!currentReason.trim()) return; // Must have a reason
		let updated;
		if (periodNumber !== null) {
			// Individual period update.
			updated = localAbsences.map((rec) => {
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
		} else {
			// Bulk update: Update every absence for this student on this date.
			updated = localAbsences.map((rec) => {
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
		}
		setLocalAbsences(updated);
		setPeriodModal({ ...periodModal, open: false });
		// Optionally add API update logic here.
	};

	if (loading) return <div className="loading">Loading absences...</div>;
	if (error) return <div className="error">Error: {error}</div>;

	return (
		<div className="absences-container">
			<h2 className="absences-title">Class Absences Overview</h2>
			{Object.keys(absencesByWeek).length === 0 ? (
				<p className="no-data">No absences to display.</p>
			) : (
				Object.entries(absencesByWeek).map(([week, days]) => (
					<div key={week} className="week-group">
						<h3 className="week-title">{week}</h3>
						{Object.entries(days).map(([dateStr, studentsObj]) => (
							<div key={dateStr} className="day-card">
								<div className="day-card-header">
									<h4>{dateStr}</h4>
								</div>
								<table className="absences-table">
									<thead>
										<tr>
											<th>Student</th>
											{[...Array(7)].map((_, i) => (
												<th key={i}>P{i + 1}</th>
											))}
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{Object.entries(studentsObj).map(([stId, stData]) => {
											const { studentName, periods } = stData;
											return (
												<tr key={stId}>
													<td className="student-name-cell" title={studentName}>
														{studentName}
													</td>
													{Array.from({ length: 7 }, (_, idx) => {
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
																			? `Reason: ${reason}`
																			: "Click to excuse (provide a reason)"
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
															<span>Excuse Day</span>
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						))}
					</div>
				))
			)}
			<ExcuseModal
				open={periodModal.open}
				title={
					periodModal.periodNumber !== null
						? "Excuse This Absence"
						: `Excuse All Absences for ${periodModal.date}`
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
