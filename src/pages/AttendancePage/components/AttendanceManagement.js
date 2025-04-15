// src/pages/AttendancePage/components/AttendanceManagement.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSearch,
	faCalendarAlt,
	faUserGraduate,
	faCheckCircle,
	faTimesCircle,
	faEdit,
	faBook,
	faClock,
	faChevronLeft,
	faChevronRight,
	faExclamationTriangle,
	faChalkboardTeacher,
	faSync,
	faExclamationCircle,
	faCalendarDay,
	faFilter,
	faUsers,
	faCheck,
	faInfoCircle,
	faTags,
} from "@fortawesome/free-solid-svg-icons";

import useAuth from "../../../hooks/useAuth";
import useClassTeacher from "../../../hooks/useClassTeacher";
import useAbsences from "../../../hooks/useAbsences";
import useStudents from "../../../hooks/useStudents";
import useDepartments from "../../../hooks/useDepartments";
import useSubjects from "../../../hooks/useSubjects";
import AttendanceExcuseModal from "./AttendanceExcuseModal";
import "./AttendanceManagement.css";

const AttendanceManagement = () => {
	const { user } = useAuth();
	const departmentId = useClassTeacher();
	const { absences, loading, error, updateAbsence } = useAbsences(
		departmentId,
		user?.token
	);
	const { students, loading: studentsLoading } = useStudents(
		departmentId,
		user?.token
	);
	const { departments } = useDepartments(user?.token);
	const { subjects } = useSubjects(user?.token);

	// State management
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("all");
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedAbsence, setSelectedAbsence] = useState(null);
	const [isSelectMode, setIsSelectMode] = useState(false);
	const [selectedStudents, setSelectedStudents] = useState({});

	// Processed data
	const [absencesByDate, setAbsencesByDate] = useState({});
	const [attendanceData, setAttendanceData] = useState({});
	const [absenceCounts, setAbsenceCounts] = useState({
		total: 0,
		unhandled: 0,
		excused: 0,
		unexcused: 0,
	});

	// Process and organize absences data
	useEffect(() => {
		if (!absences || !students) return;

		// Organize absences by date and count by status
		const byDate = {};
		let totalCount = 0;
		let unhandledCount = 0;
		let excusedCount = 0;
		let unexcusedCount = 0;

		// Process each absence and organize by date
		absences.forEach((absence) => {
			// Convert the date to avoid timezone issues
			const dateObj = new Date(absence.classLog.classDate);
			const date = dateObj.toISOString().split("T")[0];

			// Filter by status if needed
			if (selectedFilter !== "all") {
				if (
					selectedFilter === "unhandled" &&
					absence.absence.isExcused !== null
				)
					return;
				if (selectedFilter === "excused" && absence.absence.isExcused !== true)
					return;
				if (
					selectedFilter === "unexcused" &&
					absence.absence.isExcused !== false
				)
					return;
			}

			// Filter by search term if needed
			if (searchTerm) {
				const term = searchTerm.toLowerCase();
				const studentName = absence.student
					? `${absence.student.firstName} ${absence.student.lastName}`.toLowerCase()
					: "";
				const subjectName = absence.classLog.subjectName
					? absence.classLog.subjectName.toLowerCase()
					: "";
				const reason = absence.absence.reason
					? absence.absence.reason.toLowerCase()
					: "";

				if (
					!studentName.includes(term) &&
					!subjectName.includes(term) &&
					!reason.includes(term)
				) {
					return;
				}
			}

			// Add to date collections
			if (!byDate[date]) {
				byDate[date] = [];
			}
			byDate[date].push(absence);

			// Update counts
			totalCount++;
			if (absence.absence.isExcused === null) {
				unhandledCount++;
			} else if (absence.absence.isExcused) {
				excusedCount++;
			} else {
				unexcusedCount++;
			}
		});

		setAbsencesByDate(byDate);
		setAbsenceCounts({
			total: totalCount,
			unhandled: unhandledCount,
			excused: excusedCount,
			unexcused: unexcusedCount,
		});

		// Set default selected date if not already set
		if (!selectedDate && Object.keys(byDate).length > 0) {
			const today = new Date().toISOString().split("T")[0];

			if (byDate[today]) {
				setSelectedDate(today);
			} else {
				// Find the most recent date with absences
				const dates = Object.keys(byDate).sort();
				const mostRecent = dates[dates.length - 1];
				setSelectedDate(mostRecent);
			}
		}
	}, [absences, selectedFilter, searchTerm, students, selectedDate]);

	// Generate attendance data for selected date
	useEffect(() => {
		if (!selectedDate || !students || studentsLoading) return;

		const data = {};

		// Define periods based on day of week (Mon-Thu: 7 periods, Fri: 5 periods)
		const date = new Date(selectedDate);
		const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
		const isFriday = dayOfWeek === 5;
		const periodsCount = isFriday ? 5 : 7;

		// Initialize data structure for all periods
		for (let period = 1; period <= periodsCount; period++) {
			data[period] = {
				logs: [],
				students: {},
				hasClass: false,
				stats: {
					present: 0,
					absent: 0,
				},
			};
		}

		// Process absences for this date
		if (absencesByDate[selectedDate]) {
			// Group absences by period and class log
			absencesByDate[selectedDate].forEach((absence) => {
				const period = parseInt(absence.classLog.period);
				if (!period || period > periodsCount) return;

				// Add class log if not already added
				const logExists = data[period].logs.some(
					(log) => log.id === absence.classLog.id
				);

				if (!logExists) {
					data[period].logs.push({
						id: absence.classLog.id,
						subjectId: absence.classLog.subjectId,
						subjectName: absence.classLog.subjectName || "Unknown Subject",
						lectureTitle: absence.classLog.lectureTitle,
						teacherId: absence.classLog.teacherId,
						teacherName: absence.classLog.teacherName || "Unknown Teacher",
					});
					data[period].hasClass = true;
				}

				// Add student absence
				if (absence.student) {
					data[period].students[absence.student.id] = {
						id: absence.student.id,
						firstName: absence.student.firstName,
						lastName: absence.student.lastName,
						absenceId: absence.absence.id,
						isExcused: absence.absence.isExcused,
						reason: absence.absence.reason || "",
						isPresent: false,
					};

					// Update stats
					data[period].stats.absent++;
				}
			});
		}

		// Add all students to periods with classes
		for (let period = 1; period <= periodsCount; period++) {
			// Skip periods with no class logged
			if (!data[period].hasClass) continue;

			students.forEach((student) => {
				// If student is not already marked absent, mark as present
				if (!data[period].students[student.id]) {
					data[period].students[student.id] = {
						id: student.id,
						firstName: student.firstName,
						lastName: student.lastName,
						isPresent: true,
					};

					// Update present count
					data[period].stats.present++;
				}
			});
		}

		setAttendanceData(data);
	}, [selectedDate, students, studentsLoading, absencesByDate]);

	// Get department name
	const getDepartmentName = () => {
		if (!departmentId || !departments || !departments.length) return "";
		const department = departments.find((d) => d.id === departmentId);
		return department ? department.departmentName : "";
	};

	// Calendar generation
	const getDaysInMonth = (year, month) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const generateCalendarDays = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const daysInMonth = getDaysInMonth(year, month);

		// Get the correct first day of month (adjusting for week starting Monday)
		const firstDayOfMonth = new Date(year, month, 1).getDay();
		const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

		const days = [];

		// Add empty cells for days before the 1st of month
		for (let i = 0; i < offset; i++) {
			days.push({ day: null, date: null });
		}

		// Add days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			const dateString = date.toISOString().split("T")[0];

			// Check if date has absences
			const hasAbsences =
				absencesByDate[dateString] && absencesByDate[dateString].length > 0;

			// Check for unhandled absences
			const hasUnhandled =
				hasAbsences &&
				absencesByDate[dateString].some(
					(absence) => absence.absence.isExcused === null
				);

			const isSelected = dateString === selectedDate;
			const isToday = new Date().toISOString().split("T")[0] === dateString;

			days.push({
				day,
				date: dateString,
				hasAbsences,
				hasUnhandled,
				isSelected,
				isToday,
			});
		}

		return days;
	};

	// Month navigation
	const goToPreviousMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		);
	};

	const goToNextMonth = () => {
		// Don't allow navigating past the current month
		const nextMonth = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth() + 1,
			1
		);
		if (nextMonth <= new Date()) {
			setCurrentMonth(nextMonth);
		}
	};

	// Format functions
	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatMonthYear = () => {
		return currentMonth.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});
	};

	// Handle opening excuse modal
	const handleExcuseAbsence = (absence) => {
		setSelectedAbsence(absence);
		setIsModalOpen(true);
	};

	// Handle saving excuse
	const handleSaveExcuse = async (isExcused, reason) => {
		if (!selectedAbsence) return;

		try {
			await updateAbsence(selectedAbsence.absence.id, isExcused, reason);
			setIsModalOpen(false);
		} catch (err) {
			console.error("Error updating absence:", err);
		}
	};

	// Toggle selection mode
	const toggleSelectMode = () => {
		setIsSelectMode(!isSelectMode);
		setSelectedStudents({});
	};

	// Handle student selection
	const handleStudentSelect = (studentId, periodId) => {
		const key = `${studentId}-${periodId}`;
		setSelectedStudents((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	// Handle filter selection
	const handleFilterSelect = (filter) => {
		setSelectedFilter(filter);
	};

	// Handle batch excuse operations
	const handleBatchExcuse = async (isExcused) => {
		const selectedKeys = Object.keys(selectedStudents).filter(
			(key) => selectedStudents[key]
		);

		if (selectedKeys.length === 0) {
			alert("Please select at least one absence to update.");
			return;
		}

		const reason = isExcused
			? prompt("Enter reason for excusing these absences:")
			: "";

		if (isExcused && !reason) {
			alert("A reason is required for excused absences.");
			return;
		}

		// Process each selected absence
		for (const key of selectedKeys) {
			const [studentId, periodId] = key.split("-");
			const student = attendanceData[periodId].students[studentId];

			if (student && student.absenceId) {
				try {
					await updateAbsence(student.absenceId, isExcused, reason);
				} catch (err) {
					console.error(
						`Error updating absence for ${student.firstName} ${student.lastName}:`,
						err
					);
				}
			}
		}

		// Exit select mode after batch operation
		setIsSelectMode(false);
		setSelectedStudents({});
	};

	// Handle excuse all unhandled absences
	const handleExcuseAllUnhandled = async (isExcused) => {
		// Count unhandled absences for the selected date
		let unhandledCount = 0;
		Object.values(attendanceData).forEach((periodData) => {
			Object.values(periodData.students).forEach((student) => {
				if (!student.isPresent && student.isExcused === null) {
					unhandledCount++;
				}
			});
		});

		if (unhandledCount === 0) {
			alert("There are no unhandled absences to update.");
			return;
		}

		const reason = isExcused
			? prompt(`Enter reason for excusing ${unhandledCount} absences:`)
			: "";

		if (isExcused && !reason) {
			alert("A reason is required for excused absences.");
			return;
		}

		// Process all unhandled absences for this date
		for (const periodId in attendanceData) {
			const periodData = attendanceData[periodId];
			for (const studentId in periodData.students) {
				const student = periodData.students[studentId];
				if (
					!student.isPresent &&
					student.isExcused === null &&
					student.absenceId
				) {
					try {
						await updateAbsence(student.absenceId, isExcused, reason);
					} catch (err) {
						console.error(
							`Error updating absence for ${student.firstName} ${student.lastName}:`,
							err
						);
					}
				}
			}
		}
	};

	// Sort students alphabetically by last name
	const sortStudents = (students) => {
		return Object.values(students).sort((a, b) => {
			if (a.lastName === b.lastName) {
				return a.firstName.localeCompare(b.firstName);
			}
			return a.lastName.localeCompare(b.lastName);
		});
	};

	// Count selected students
	const countSelectedStudents = () => {
		return Object.values(selectedStudents).filter((selected) => selected)
			.length;
	};

	// Loading state
	if (loading || studentsLoading) {
		return (
			<div className="attendance-container">
				<div className="empty-state">
					<div className="loading-spinner"></div>
					<h3 className="empty-title">Loading Attendance Data</h3>
					<p className="empty-text">
						Please wait while we fetch the attendance records...
					</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="attendance-container">
				<div className="empty-state">
					<FontAwesomeIcon icon={faExclamationCircle} className="empty-icon" />
					<h3 className="empty-title">Error Loading Attendance</h3>
					<p className="empty-text">{error}</p>
					<button
						className="action-button primary-button"
						onClick={() => window.location.reload()}
					>
						<FontAwesomeIcon icon={faSync} /> Retry
					</button>
				</div>
			</div>
		);
	}

	const departmentName = getDepartmentName();
	const calendarDays = generateCalendarDays();

	return (
		<div className="attendance-container">
			{/* Left Sidebar */}
			<div className="attendance-sidebar">
				{/* Header with department name and counts */}
				<div className="sidebar-header">
					<h2 className="sidebar-title">Attendance</h2>
					<div className="department-name">{departmentName}</div>

					<div className="absence-counts">
						<div className="absence-count">
							<div className="count-value">{absenceCounts.total}</div>
							<div className="count-label">Total</div>
						</div>
						<div className="absence-count">
							<div className="count-value count-unhandled">
								{absenceCounts.unhandled}
							</div>
							<div className="count-label">Unhandled</div>
						</div>
						<div className="absence-count">
							<div className="count-value count-excused">
								{absenceCounts.excused}
							</div>
							<div className="count-label">Excused</div>
						</div>
						<div className="absence-count">
							<div className="count-value count-unexcused">
								{absenceCounts.unexcused}
							</div>
							<div className="count-label">Unexcused</div>
						</div>
					</div>
				</div>

				{/* Calendar */}
				<div className="calendar-container">
					<div className="calendar-header">
						<span className="month-name">{formatMonthYear()}</span>
						<div className="month-nav">
							<button className="month-nav-btn" onClick={goToPreviousMonth}>
								<FontAwesomeIcon icon={faChevronLeft} />
							</button>
							<button
								className="month-nav-btn"
								onClick={goToNextMonth}
								disabled={
									new Date(
										currentMonth.getFullYear(),
										currentMonth.getMonth() + 1,
										1
									) > new Date()
								}
							>
								<FontAwesomeIcon icon={faChevronRight} />
							</button>
						</div>
					</div>

					<div className="calendar">
						{/* Weekday headers */}
						<div className="weekday-header">Mo</div>
						<div className="weekday-header">Tu</div>
						<div className="weekday-header">We</div>
						<div className="weekday-header">Th</div>
						<div className="weekday-header">Fr</div>
						<div className="weekday-header">Sa</div>
						<div className="weekday-header">Su</div>

						{/* Calendar days */}
						{calendarDays.map((day, index) => (
							<div
								key={index}
								className={`calendar-day 
                  ${!day.day ? "empty" : ""} 
                  ${day.isToday ? "today" : ""} 
                  ${day.isSelected ? "selected" : ""} 
                  ${day.hasAbsences ? "has-absences" : ""}
                  ${day.hasUnhandled ? "has-unhandled" : ""}`}
								onClick={() => day.day && setSelectedDate(day.date)}
							>
								{day.day && day.day}
							</div>
						))}
					</div>
				</div>

				{/* Filters */}
				<div className="filter-section">
					<div className="filter-label">Filter Absences</div>

					<div
						className={`filter-option ${
							selectedFilter === "all" ? "active" : ""
						}`}
						onClick={() => handleFilterSelect("all")}
					>
						<FontAwesomeIcon icon={faFilter} className="filter-icon" />
						<span className="filter-text">All Absences</span>
						<span className="filter-count">{absenceCounts.total}</span>
					</div>

					<div
						className={`filter-option ${
							selectedFilter === "unhandled" ? "active" : ""
						}`}
						onClick={() => handleFilterSelect("unhandled")}
					>
						<FontAwesomeIcon
							icon={faExclamationTriangle}
							className="filter-icon"
						/>
						<span className="filter-text">Unhandled</span>
						<span className="filter-count">{absenceCounts.unhandled}</span>
					</div>

					<div
						className={`filter-option ${
							selectedFilter === "excused" ? "active" : ""
						}`}
						onClick={() => handleFilterSelect("excused")}
					>
						<FontAwesomeIcon icon={faCheckCircle} className="filter-icon" />
						<span className="filter-text">Excused</span>
						<span className="filter-count">{absenceCounts.excused}</span>
					</div>

					<div
						className={`filter-option ${
							selectedFilter === "unexcused" ? "active" : ""
						}`}
						onClick={() => handleFilterSelect("unexcused")}
					>
						<FontAwesomeIcon icon={faTimesCircle} className="filter-icon" />
						<span className="filter-text">Unexcused</span>
						<span className="filter-count">{absenceCounts.unexcused}</span>
					</div>

					<div className="search-container">
						<FontAwesomeIcon icon={faSearch} className="search-icon" />
						<input
							type="text"
							className="search-input"
							placeholder="Search students or subjects..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="attendance-main">
				{selectedDate ? (
					<>
						{/* Header with selected date and actions */}
						<div className="main-header">
							<div className="selected-date">
								<FontAwesomeIcon icon={faCalendarDay} className="date-icon" />
								{formatDate(selectedDate)}
							</div>

							<div className="action-buttons">
								{absenceCounts.unhandled > 0 && (
									<>
										<button
											className="action-button primary-button"
											onClick={() => handleExcuseAllUnhandled(true)}
										>
											<FontAwesomeIcon icon={faCheckCircle} /> Excuse All
											Unhandled
										</button>
										<button
											className="action-button warning-button"
											onClick={() => handleExcuseAllUnhandled(false)}
										>
											<FontAwesomeIcon icon={faTimesCircle} /> Mark All as
											Unexcused
										</button>
									</>
								)}

								<button
									className="action-button secondary-button"
									onClick={toggleSelectMode}
								>
									<FontAwesomeIcon icon={faUsers} />
									{isSelectMode ? "Cancel Selection" : "Select Multiple"}
								</button>
							</div>
						</div>

						{/* Absences content */}
						<div className="absences-container">
							{/* If there are periods with classes */}
							{Object.entries(attendanceData).some(
								([_, data]) => data.hasClass
							) ? (
								<div className="period-list">
									{Object.entries(attendanceData)
										.filter(([_, data]) => data.hasClass)
										.map(([period, data]) => {
											const sortedStudents = sortStudents(data.students);
											const absentStudents = sortedStudents.filter(
												(s) => !s.isPresent
											);

											return (
												<div key={period} className="period-card">
													<div className="period-header">
														<div className="period-info">
															<div className="period-number">{period}</div>
															<div className="period-details">
																<div className="subject-name">
																	{data.logs[0]?.subjectName ||
																		"Unknown Subject"}
																</div>
																<div className="lecture-title">
																	{data.logs[0]?.lectureTitle ||
																		"No lecture title"}
																</div>
															</div>
														</div>

														<div className="period-stats">
															<div className="period-stat stat-present">
																<FontAwesomeIcon icon={faCheckCircle} />{" "}
																{data.stats.present} Present
															</div>
															<div className="period-stat stat-absent">
																<FontAwesomeIcon icon={faTimesCircle} />{" "}
																{data.stats.absent} Absent
															</div>
														</div>
													</div>

													{isSelectMode && absentStudents.length > 0 && (
														<div className="period-actions">
															<button
																className="action-button secondary-button"
																onClick={() => {
																	// Select/deselect all absent students in this period
																	const newSelected = { ...selectedStudents };
																	const allSelected = absentStudents.every(
																		(s) => selectedStudents[`${s.id}-${period}`]
																	);

																	absentStudents.forEach((s) => {
																		newSelected[`${s.id}-${period}`] =
																			!allSelected;
																	});

																	setSelectedStudents(newSelected);
																}}
															>
																<FontAwesomeIcon icon={faCheck} />
																{absentStudents.every(
																	(s) => selectedStudents[`${s.id}-${period}`]
																)
																	? "Deselect All"
																	: "Select All Absent"}
															</button>

															{countSelectedStudents() > 0 && (
																<>
																	<button
																		className="action-button primary-button"
																		onClick={() => handleBatchExcuse(true)}
																	>
																		<FontAwesomeIcon icon={faCheckCircle} />
																		Excuse Selected ({countSelectedStudents()})
																	</button>
																	<button
																		className="action-button warning-button"
																		onClick={() => handleBatchExcuse(false)}
																	>
																		<FontAwesomeIcon icon={faTimesCircle} />
																		Mark Selected as Unexcused
																	</button>
																</>
															)}
														</div>
													)}

													<div className="student-list">
														{absentStudents.map((student) => {
															const key = `${student.id}-${period}`;
															const isSelected = selectedStudents[key];

															let statusText = "";
															let statusClass = "";

															if (student.isExcused === null) {
																statusText = "Unhandled";
																statusClass = "status-unhandled";
															} else if (student.isExcused) {
																statusText = "Excused";
																statusClass = "status-excused";
															} else {
																statusText = "Unexcused";
																statusClass = "status-unexcused";
															}

															return (
																<div key={student.id} className="student-row">
																	<div className="student-info">
																		{isSelectMode && (
																			<input
																				type="checkbox"
																				className="student-checkbox"
																				checked={!!isSelected}
																				onChange={() =>
																					handleStudentSelect(
																						student.id,
																						period
																					)
																				}
																			/>
																		)}
																		{student.firstName} {student.lastName}
																	</div>

																	<div className="student-controls">
																		<span
																			className={`status-indicator ${statusClass}`}
																		>
																			{statusText}
																		</span>

																		{student.isExcused && student.reason && (
																			<span
																				className="reason-text"
																				title={student.reason}
																			>
																				{student.reason}
																			</span>
																		)}

																		{!isSelectMode && (
																			<button
																				className="handle-button"
																				onClick={() => {
																					handleExcuseAbsence({
																						student,
																						absence: {
																							id: student.absenceId,
																							isExcused: student.isExcused,
																							reason: student.reason || "",
																						},
																						classLog: {
																							id: data.logs[0]?.id,
																							classDate: selectedDate,
																							period: period.toString(),
																							subjectId:
																								data.logs[0]?.subjectId,
																							subjectName:
																								data.logs[0]?.subjectName,
																							lectureTitle:
																								data.logs[0]?.lectureTitle,
																						},
																					});
																				}}
																			>
																				<FontAwesomeIcon icon={faEdit} />
																				{student.isExcused === null
																					? "Handle"
																					: "Edit"}
																			</button>
																		)}
																	</div>
																</div>
															);
														})}
													</div>
												</div>
											);
										})}
								</div>
							) : (
								<div className="empty-state">
									<FontAwesomeIcon icon={faInfoCircle} className="empty-icon" />
									<h3 className="empty-title">No Classes Found</h3>
									<p className="empty-text">
										There are no classes logged for this date or matching your
										filters.
									</p>
								</div>
							)}
						</div>
					</>
				) : (
					<div className="empty-state">
						<FontAwesomeIcon icon={faCalendarAlt} className="empty-icon" />
						<h3 className="empty-title">Select a Date</h3>
						<p className="empty-text">
							Please select a date from the calendar to view absences.
						</p>
					</div>
				)}
			</div>

			{/* Excuse Modal */}
			{isModalOpen && selectedAbsence && (
				<AttendanceExcuseModal
					absence={selectedAbsence}
					onClose={() => setIsModalOpen(false)}
					onSave={handleSaveExcuse}
				/>
			)}
		</div>
	);
};

export default AttendanceManagement;
