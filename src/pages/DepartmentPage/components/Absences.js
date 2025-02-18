import React, { useState, useMemo } from "react";
import "./Absences.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCheck,
	faTimes,
	faCalendarCheck,
	faCalendarMinus,
	faEdit,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Helper to compute the Week number from a date string (YYYY-MM-DD).
 */
const getWeekNumber = (dateString) => {
	const date = new Date(dateString);
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
	return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const AbsencesRefined = ({ students = [], onDataChange }) => {
	// Modal state for editing a single period's excuse
	const [periodModal, setPeriodModal] = useState({
		open: false,
		studentId: null,
		date: null,
		periodNumber: null,
		currentReason: "",
	});

	// Modal state for bulk (entire-day) excuse
	const [bulkModal, setBulkModal] = useState({
		open: false,
		date: null,
		currentReason: "",
	});

	/**
	 *  ================
	 *  PERIOD HANDLERS
	 *  ================
	 */

	// Toggle resolved for a single period (absent <-> excused).
	const togglePeriodResolved = (studentId, date, periodNumber) => {
		const updatedStudents = students.map((student) => {
			if (student.id !== studentId) return student;
			return {
				...student,
				absenceHistory: student.absenceHistory.map((day) => {
					if (day.date !== date) return day;
					return {
						...day,
						periods: day.periods.map((p) =>
							p.number === periodNumber ? { ...p, resolved: !p.resolved } : p
						),
					};
				}),
			};
		});
		onDataChange(updatedStudents);
	};

	// Open modal to set or edit a reason for a single absent period.
	const openPeriodExcuseModal = (
		studentId,
		date,
		periodNumber,
		currentReason
	) => {
		setPeriodModal({
			open: true,
			studentId,
			date,
			periodNumber,
			currentReason: currentReason || "",
		});
	};

	// When user saves the excuse (single period).
	const savePeriodExcuse = () => {
		const { studentId, date, periodNumber, currentReason } = periodModal;
		const updatedStudents = students.map((student) => {
			if (student.id !== studentId) return student;
			return {
				...student,
				absenceHistory: student.absenceHistory.map((day) => {
					if (day.date !== date) return day;
					return {
						...day,
						periods: day.periods.map((p) => {
							if (p.number === periodNumber) {
								return {
									...p,
									resolved: true, // Mark it as resolved when excused
									reason: currentReason,
								};
							}
							return p;
						}),
					};
				}),
			};
		});
		onDataChange(updatedStudents);
		setPeriodModal({ ...periodModal, open: false });
	};

	/**
	 *  ==============
	 *  DAY HANDLERS
	 *  ==============
	 */

	// Toggle an entire day as resolved/unresolved for a SINGLE student.
	const toggleDayResolvedForStudent = (studentId, date) => {
		const updatedStudents = students.map((student) => {
			if (student.id !== studentId) return student;
			const dayEntry = student.absenceHistory.find((d) => d.date === date);
			if (!dayEntry) return student;

			const anyUnresolved = dayEntry.periods.some((p) => !p.resolved);
			return {
				...student,
				absenceHistory: student.absenceHistory.map((day) => {
					if (day.date !== date) return day;
					return {
						...day,
						periods: day.periods.map((p) => ({
							...p,
							resolved: anyUnresolved ? true : false,
						})),
					};
				}),
			};
		});
		onDataChange(updatedStudents);
	};

	// Toggle an entire day as resolved/unresolved for ALL students.
	const toggleDayResolvedForAll = (date) => {
		let anyUnresolved = false;
		students.forEach((student) => {
			const dayEntry = student.absenceHistory.find((d) => d.date === date);
			if (dayEntry && dayEntry.periods.some((p) => !p.resolved)) {
				anyUnresolved = true;
			}
		});
		const updatedStudents = students.map((student) => {
			const dayEntry = student.absenceHistory.find((d) => d.date === date);
			if (!dayEntry) return student;
			return {
				...student,
				absenceHistory: student.absenceHistory.map((day) => {
					if (day.date !== date) return day;
					return {
						...day,
						periods: day.periods.map((p) => ({
							...p,
							resolved: anyUnresolved ? true : false,
						})),
					};
				}),
			};
		});
		onDataChange(updatedStudents);
	};

	/**
	 *  ===============
	 *  BULK EXCUSE DAY
	 *  ===============
	 */

	// Open modal to set one excuse for *all absent periods* on that day.
	const openBulkExcuseModal = (date) => {
		setBulkModal({ open: true, date, currentReason: "" });
	};

	// When user saves the excuse for the entire day (all students' absent periods).
	const saveBulkExcuse = () => {
		const { date, currentReason } = bulkModal;
		const updatedStudents = students.map((student) => {
			const dayEntry = student.absenceHistory.find((d) => d.date === date);
			if (!dayEntry) return student;
			return {
				...student,
				absenceHistory: student.absenceHistory.map((day) => {
					if (day.date !== date) return day;
					return {
						...day,
						periods: day.periods.map((p) => {
							// If they're absent, we set a reason & resolved = true
							if (p.resolved === false) {
								return { ...p, resolved: true, reason: currentReason };
							}
							return p;
						}),
					};
				}),
			};
		});
		onDataChange(updatedStudents);
		setBulkModal({ ...bulkModal, open: false });
	};

	/**
	 * Group absences by Week -> Date -> { student data }
	 */
	const absencesByWeek = useMemo(() => {
		let flattened = [];
		students.forEach((student) => {
			student.absenceHistory?.forEach((day) => {
				flattened.push({
					studentId: student.id,
					studentName: student.name,
					date: day.date,
					week: `Week ${getWeekNumber(day.date)}`,
					periods: day.periods,
				});
			});
		});

		const grouped = {};
		flattened.forEach((item) => {
			const { week, date, studentId, studentName, periods } = item;
			if (!grouped[week]) grouped[week] = {};
			if (!grouped[week][date]) grouped[week][date] = {};
			grouped[week][date][studentId] = { studentName, periods };
		});
		return grouped;
	}, [students]);

	return (
		<div className="absences-refined__container">
			<h2 className="absences-refined__title">Class Absences Overview</h2>

			<div className="absences-refined__content">
				{Object.keys(absencesByWeek).length === 0 && (
					<p className="absences-refined__no-data">No absences to display.</p>
				)}

				{Object.entries(absencesByWeek).map(([week, days]) => (
					<div key={week} className="absences-refined__week-block">
						<h3 className="absences-refined__week-title">{week}</h3>

						{Object.entries(days).map(([date, studentsObj]) => (
							<div key={date} className="absences-refined__day-card">
								<div className="absences-refined__day-card-header">
									<h4>{date}</h4>
									<div className="absences-refined__day-buttons">
										{/* Toggle day for all students (resolve/unresolve) */}
										<button
											className="absences-refined__day-toggle-btn"
											onClick={() => toggleDayResolvedForAll(date)}
										>
											<FontAwesomeIcon icon={faCalendarCheck} />
											<span>Toggle (All)</span>
										</button>
										{/* Bulk excuse day: sets a reason for all absent periods */}
										<button
											className="absences-refined__day-excuse-btn"
											onClick={() => openBulkExcuseModal(date)}
										>
											<FontAwesomeIcon icon={faEdit} />
											<span>Excuse Day</span>
										</button>
									</div>
								</div>

								<table className="absences-refined__table">
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
													<td className="absences-refined__student-name">
														{studentName}
													</td>

													{/* 7 Periods */}
													{Array.from({ length: 7 }, (_, idx) => {
														const period = periods.find(
															(p) => p.number === idx + 1
														);
														if (!period) {
															// Student was present
															return (
																<td
																	key={idx}
																	className="absences-refined__cell-present"
																>
																	✓
																</td>
															);
														}
														// Student is absent
														const { resolved, reason } = period;
														const cellClass = resolved
															? "absences-refined__cell-resolved"
															: "absences-refined__cell-unresolved";

														return (
															<td key={idx} className={cellClass}>
																{/* Icon: resolved or unresolved */}
																<div
																	className="absences-refined__cell-icon"
																	onClick={() =>
																		togglePeriodResolved(stId, date, idx + 1)
																	}
																	title={
																		reason
																			? `Reason: ${reason}`
																			: "Click to toggle resolved"
																	}
																>
																	{resolved ? (
																		<FontAwesomeIcon icon={faCheck} />
																	) : (
																		<FontAwesomeIcon icon={faTimes} />
																	)}
																</div>

																{/* Button to open single-period "Excuse" modal */}
																<button
																	className="absences-refined__excuse-btn"
																	onClick={() =>
																		openPeriodExcuseModal(
																			stId,
																			date,
																			idx + 1,
																			reason
																		)
																	}
																>
																	{resolved ? "Edit" : "Excuse"}
																</button>
															</td>
														);
													})}

													<td className="absences-refined__actions-col">
														<button
															className="absences-refined__toggle-student-day-btn"
															onClick={() =>
																toggleDayResolvedForStudent(stId, date)
															}
														>
															<FontAwesomeIcon icon={faCalendarMinus} />
															Toggle Day
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
				))}
			</div>

			{/* ====== Single-Period Excuse Modal ====== */}
			{periodModal.open && (
				<div className="absences-refined__modal-backdrop">
					<div className="absences-refined__modal">
						<h3>Excuse This Absence</h3>
						<label>Reason</label>
						<textarea
							value={periodModal.currentReason}
							onChange={(e) =>
								setPeriodModal({
									...periodModal,
									currentReason: e.target.value,
								})
							}
							placeholder="e.g., Doctor's appointment, Late arrival, etc."
						/>
						<div className="absences-refined__modal-buttons">
							<button
								className="absences-refined__btn-cancel"
								onClick={() => setPeriodModal({ ...periodModal, open: false })}
							>
								Cancel
							</button>
							<button
								className="absences-refined__btn-primary"
								onClick={savePeriodExcuse}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ====== Bulk Excuse Day Modal ====== */}
			{bulkModal.open && (
				<div className="absences-refined__modal-backdrop">
					<div className="absences-refined__modal">
						<h3>Excuse All Absent Periods for {bulkModal.date}</h3>
						<label>Reason</label>
						<textarea
							value={bulkModal.currentReason}
							onChange={(e) =>
								setBulkModal({ ...bulkModal, currentReason: e.target.value })
							}
							placeholder="e.g., Field trip, Snow day, etc."
						/>
						<div className="absences-refined__modal-buttons">
							<button
								className="absences-refined__btn-cancel"
								onClick={() => setBulkModal({ ...bulkModal, open: false })}
							>
								Cancel
							</button>
							<button
								className="absences-refined__btn-primary"
								onClick={saveBulkExcuse}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AbsencesRefined;
