import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCheck,
	faTimes,
	faCalendarCheck,
	faCalendarMinus,
	faEdit,
} from "@fortawesome/free-solid-svg-icons";

import "./Absences.css";
// Custom hooks
import { useAbsences, useAuth } from "../../../hooks";

// This departmentId is just a placeholder for the example
const tempDepartmentId = "673b94896d216a12b56d0c17";

/**
 * Helper to compute the Week number from a date string.
 */
const getWeekNumber = (dateString) => {
	const date = new Date(dateString);
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
	return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const AbsencesRefined = () => {
	const { user } = useAuth();
	const token = user?.token;

	// 1) Fetch data from your API (via the hook)
	//    `absences` is the raw array with each record = { absence, student, classLog, etc. }
	const { absences, loading, error } = useAbsences(tempDepartmentId, token);

	// 2) Maintain a local copy so we can update (toggle excuse) in-memory.
	//    In a real scenario, you might PATCH/PUT to the server, then refetch or
	//    optimistically update state here.
	const [localAbsences, setLocalAbsences] = useState([]);

	useEffect(() => {
		if (!loading && absences) {
			// On first load (or whenever data changes), store them locally
			setLocalAbsences(absences);
		}
	}, [absences, loading]);

	/**
	 * Utility: Convert the raw `localAbsences` data into a structure:
	 *  {
	 *    "Week 5": {
	 *      "2025-01-28": {
	 *        [studentId]: {
	 *           studentName: "John Doe",
	 *           periods: [
	 *             { absenceId: "...", number: 7, resolved: false, reason: null },
	 *             ...
	 *           ]
	 *        },
	 *        ...
	 *      },
	 *      "2025-01-29": {...}
	 *    }
	 *  }
	 */
	const absencesByWeek = useMemo(() => {
		const grouped = {};

		for (const record of localAbsences) {
			const { absence, student, classLog } = record;

			// Example fields:
			// absence.isExcused => boolean (true => resolved)
			// absence.reason => string or null
			// classLog.classDate => "2025-01-28T00:00:00Z"
			// classLog.period => "7"

			const rawDate = classLog.classDate; // e.g. "2025-01-28T00:00:00Z"
			// Convert to YYYY-MM-DD
			const dateObj = new Date(rawDate);
			const dateStr = dateObj.toISOString().split("T")[0];

			const weekLabel = `Week ${getWeekNumber(dateStr)}`;
			const studentId = student.id;
			const studentName = `${student.firstName} ${student.lastName}`.trim();
			const periodNumber = parseInt(classLog.period, 10) || 1;

			// Insert into grouped object
			if (!grouped[weekLabel]) {
				grouped[weekLabel] = {};
			}
			if (!grouped[weekLabel][dateStr]) {
				grouped[weekLabel][dateStr] = {};
			}
			if (!grouped[weekLabel][dateStr][studentId]) {
				grouped[weekLabel][dateStr][studentId] = {
					studentName,
					periods: [],
				};
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

	// ========================
	// =    MODAL STATES     =
	// ========================
	const [periodModal, setPeriodModal] = useState({
		open: false,
		absenceId: null,
		date: "",
		studentId: null,
		periodNumber: null,
		currentReason: "",
	});

	const [bulkModal, setBulkModal] = useState({
		open: false,
		date: "",
		currentReason: "",
	});

	// ========================
	// =   HANDLER METHODS   =
	// ========================

	/**
	 * Toggle "resolved" (excused) for a single absent period in local state.
	 */
	const togglePeriodResolved = (absenceId) => {
		const updated = localAbsences.map((rec) => {
			if (rec.absence.id === absenceId) {
				return {
					...rec,
					absence: {
						...rec.absence,
						isExcused: !rec.absence.isExcused,
					},
				};
			}
			return rec;
		});
		setLocalAbsences(updated);

		// In a real app, you'd also do:
		// absenceApi.patchAbsence(absenceId, { isExcused: newValue })
		//   .then(...) // success
		//   .catch(...) // rollback if needed
	};

	/**
	 * Open a modal to excuse (or edit the excuse of) a single period.
	 * We'll store its current `reason` and `absenceId`.
	 */
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

	/**
	 * Save the typed reason for a single absent period,
	 * marking it as resolved in local state.
	 */
	const savePeriodExcuse = () => {
		const { absenceId, currentReason } = periodModal;

		const updated = localAbsences.map((rec) => {
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

		setLocalAbsences(updated);
		setPeriodModal({ ...periodModal, open: false });

		// Example server update:
		// await absenceApi.patchAbsence(absenceId, {
		//   isExcused: true,
		//   reason: currentReason
		// });
	};

	/**
	 * Toggle an entire day (resolved/unresolved) for a single student.
	 * We find all records that match (same date + studentId) and flip them.
	 */
	const toggleDayResolvedForStudent = (studentId, dateStr) => {
		const updated = localAbsences.map((rec) => {
			const recDate = new Date(rec.classLog.classDate)
				.toISOString()
				.split("T")[0];
			if (rec.student.id === studentId && recDate === dateStr) {
				// Flip isExcused
				return {
					...rec,
					absence: {
						...rec.absence,
						isExcused: !rec.absence.isExcused,
					},
				};
			}
			return rec;
		});
		setLocalAbsences(updated);

		// Real API calls could iterate the relevant absenceIds and patch each.
	};

	/**
	 * Toggle an entire day for all students (resolve/unresolve).
	 */
	const toggleDayResolvedForAll = (dateStr) => {
		// First, see if there's ANY "unresolved" record for that date
		const anyUnresolved = localAbsences.some((rec) => {
			const recDate = new Date(rec.classLog.classDate)
				.toISOString()
				.split("T")[0];
			return recDate === dateStr && rec.absence.isExcused === false;
		});

		// Then flip them all accordingly
		const updated = localAbsences.map((rec) => {
			const recDate = new Date(rec.classLog.classDate)
				.toISOString()
				.split("T")[0];
			if (recDate === dateStr) {
				return {
					...rec,
					absence: {
						...rec.absence,
						isExcused: anyUnresolved ? true : false,
					},
				};
			}
			return rec;
		});
		setLocalAbsences(updated);
	};

	/**
	 * Bulk Excuse Modal:
	 * Open a modal to set the same reason for all absent periods on this date
	 * (for all students).
	 */
	const openBulkExcuseModal = (dateStr) => {
		setBulkModal({
			open: true,
			date: dateStr,
			currentReason: "",
		});
	};

	/**
	 * Apply a single reason to every "unresolved" record on this date,
	 * marking them as excused.
	 */
	const saveBulkExcuse = () => {
		const { date, currentReason } = bulkModal;

		const updated = localAbsences.map((rec) => {
			const recDate = new Date(rec.classLog.classDate)
				.toISOString()
				.split("T")[0];
			if (recDate === date && rec.absence.isExcused === false) {
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

		setLocalAbsences(updated);
		setBulkModal({ ...bulkModal, open: false });

		// Real API calls: patch each relevant absence or add a special endpoint
	};

	// ===========================
	// =       RENDER UI        =
	// ===========================

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
									<div className="day-buttons">
										<button
											className="day-toggle-btn"
											onClick={() => toggleDayResolvedForAll(dateStr)}
										>
											<FontAwesomeIcon icon={faCalendarCheck} />
											<span>Toggle (All)</span>
										</button>
										<button
											className="day-excuse-btn"
											onClick={() => openBulkExcuseModal(dateStr)}
										>
											<FontAwesomeIcon icon={faEdit} />
											<span>Excuse Day</span>
										</button>
									</div>
								</div>

								<table className="absences-table">
									<thead>
										<tr>
											<th>Student</th>
											{/* Show periods 1..7 (or more if you prefer). 
                          In the data, some classes might have period=8, etc.
                          Adjust as needed. */}
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
													<td className="student-name-cell">{studentName}</td>

													{/* Render 7 columns for periods 1..7 */}
													{Array.from({ length: 7 }, (_, idx) => {
														const periodRecord = periods.find(
															(p) => p.number === idx + 1
														);
														if (!periodRecord) {
															// If there's no matching record, that means the student was present
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
																		togglePeriodResolved(absenceId)
																	}
																	title={
																		reason
																			? `Reason: ${reason}`
																			: "Click to toggle"
																	}
																>
																	{resolved ? (
																		<FontAwesomeIcon icon={faCheck} />
																	) : (
																		<FontAwesomeIcon icon={faTimes} />
																	)}
																</div>
																<button
																	className="excuse-btn"
																	onClick={() =>
																		openPeriodExcuseModal(
																			absenceId,
																			dateStr,
																			stId,
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

													<td>
														<button
															className="toggle-student-day-btn"
															onClick={() =>
																toggleDayResolvedForStudent(stId, dateStr)
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
				))
			)}

			{/* =================================
          SINGLE-PERIOD EXCUSE MODAL
      ================================== */}
			{periodModal.open && (
				<div className="modal-backdrop">
					<div className="modal">
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
						<div className="modal-buttons">
							<button
								className="btn-cancel"
								onClick={() => setPeriodModal({ ...periodModal, open: false })}
							>
								Cancel
							</button>
							<button className="btn-primary" onClick={savePeriodExcuse}>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{/* =================================
          BULK EXCUSE (ENTIRE DAY) MODAL
      ================================== */}
			{bulkModal.open && (
				<div className="modal-backdrop">
					<div className="modal">
						<h3>Excuse All Absent Periods for {bulkModal.date}</h3>
						<label>Reason</label>
						<textarea
							value={bulkModal.currentReason}
							onChange={(e) =>
								setBulkModal({ ...bulkModal, currentReason: e.target.value })
							}
							placeholder="e.g., Field trip, Snow day, etc."
						/>
						<div className="modal-buttons">
							<button
								className="btn-cancel"
								onClick={() => setBulkModal({ ...bulkModal, open: false })}
							>
								Cancel
							</button>
							<button className="btn-primary" onClick={saveBulkExcuse}>
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
