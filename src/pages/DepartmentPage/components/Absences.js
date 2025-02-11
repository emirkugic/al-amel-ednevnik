import React, { useState, useMemo } from "react";
import "./Absences.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSearch,
	faCheck,
	faTimes,
	faCalendarCheck,
	faCalendarMinus,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Helper to compute week number from a date string.
 */
const getWeekNumber = (dateString) => {
	const date = new Date(dateString);
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
	return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const Absences = ({ students = [], onDataChange }) => {
	const [search, setSearch] = useState("");
	const [dateFilter, setDateFilter] = useState("");

	/**
	 * Toggle an individual period's resolved status for one student on a specific date.
	 */
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

	/**
	 * Toggle resolved for an entire day, for one specific student only.
	 * If the student has any unresolved period, we resolve them all.
	 * Otherwise, we set them all back to unresolved.
	 */
	const toggleDayResolvedForStudent = (studentId, date) => {
		const updatedStudents = students.map((student) => {
			if (student.id !== studentId) return student;

			// Find the day
			const dayEntry = student.absenceHistory.find((d) => d.date === date);
			if (!dayEntry) return student;

			// Check if any period is unresolved
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

	/**
	 * Toggle resolved for an entire day, for ALL students.
	 * If there is any unresolved period for that date among any student, we resolve them all.
	 * Otherwise, we set them all back to unresolved.
	 */
	const toggleDayResolvedForAll = (date) => {
		// Check if any period for that date across all students is unresolved
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
	 * Memoized structure that groups absences by Week -> Date -> {student info}.
	 * We'll display it in a table with:
	 * Row = Student, Columns = Period 1..7
	 */
	const absencesByWeek = useMemo(() => {
		// Flatten absences
		let flattened = [];

		// Filter by student name search, if needed
		const lowerSearch = search.toLowerCase();

		// For each student, gather each day's data
		students.forEach((student) => {
			// If search is used, skip any student not matching
			if (search && !student.name.toLowerCase().includes(lowerSearch)) {
				return;
			}
			student.absenceHistory?.forEach((day) => {
				// If dateFilter is used, skip days that don't match
				if (dateFilter && day.date !== dateFilter) return;

				flattened.push({
					studentId: student.id,
					studentName: student.name,
					date: day.date,
					week: `Week ${getWeekNumber(day.date)}`,
					periods: day.periods, // array of { number, resolved, reason }
				});
			});
		});

		// Group them by week -> date -> [array of students & periods]
		const grouped = {};
		flattened.forEach((item) => {
			const { week, date, studentId, studentName, periods } = item;
			if (!grouped[week]) grouped[week] = {};
			if (!grouped[week][date]) grouped[week][date] = {};

			// We'll store a dictionary of studentId -> { studentName, periods }
			grouped[week][date][studentId] = {
				studentName,
				periods,
			};
		});

		return grouped;
	}, [students, search, dateFilter]);

	return (
		<div className="absences-container">
			<h2>Class Absences Overview</h2>

			{/* Filter Bar */}
			<div className="absences-filters">
				<div className="search-box">
					<FontAwesomeIcon icon={faSearch} className="search-icon" />
					<input
						type="text"
						placeholder="Search by student name..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className="filters">
					<input
						type="date"
						value={dateFilter}
						onChange={(e) => setDateFilter(e.target.value)}
					/>
				</div>
			</div>

			<div className="absences-list">
				{Object.keys(absencesByWeek).length === 0 && (
					<p className="no-data">No absences to display.</p>
				)}

				{/* For each week group */}
				{Object.entries(absencesByWeek).map(([week, days]) => (
					<div key={week} className="week-group">
						<h3>{week}</h3>

						{/* For each date within that week */}
						{Object.entries(days).map(([date, studentsObj]) => (
							<div key={date} className="day-group">
								<div className="day-header">
									<h4>{date}</h4>
									<button
										className="toggle-day-btn"
										onClick={() => toggleDayResolvedForAll(date)}
									>
										<FontAwesomeIcon icon={faCalendarCheck} /> Toggle Day (All
										Students)
									</button>
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
													<td className="student-col">{studentName}</td>

													{/* Display each period horizontally */}
													{Array.from({ length: 7 }, (_, idx) => {
														const period = periods.find(
															(p) => p.number === idx + 1
														);
														if (!period) {
															return (
																<td key={idx} className="present">
																	✓
																</td>
															);
														}
														// If the period exists
														const { resolved, reason } = period;
														return (
															<td
																key={idx}
																className={resolved ? "resolved" : "unresolved"}
																onClick={() =>
																	togglePeriodResolved(stId, date, idx + 1)
																}
																title={`Reason: ${reason || "No reason"}`}
															>
																{resolved ? (
																	<FontAwesomeIcon icon={faCheck} />
																) : (
																	<FontAwesomeIcon icon={faTimes} />
																)}
															</td>
														);
													})}
													<td className="actions-col">
														<button
															className="toggle-student-day-btn"
															onClick={() =>
																toggleDayResolvedForStudent(stId, date)
															}
														>
															<FontAwesomeIcon icon={faCalendarMinus} /> Toggle
															Day
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
		</div>
	);
};

export default Absences;
