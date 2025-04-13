// src/pages/AttendancePage/components/AttendanceManagement.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSearch,
	faTimes,
	faExclamationCircle,
	faSync,
	faCalendarAlt,
	faUserGraduate,
	faCheckCircle,
	faTimesCircle,
	faEdit,
	faBook,
	faClock,
	faCalendarDay,
	faChevronLeft,
	faChevronRight,
	faExclamationTriangle,
	faChalkboardTeacher,
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
	const [filteredAbsences, setFilteredAbsences] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedAbsence, setSelectedAbsence] = useState(null);
	const [filterExcused, setFilterExcused] = useState("all"); // 'all', 'excused', 'unexcused'
	const [selectedDate, setSelectedDate] = useState(null);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [absencesByDate, setAbsencesByDate] = useState({});
	const [attendanceData, setAttendanceData] = useState({});

	// Process and organize absences data
	useEffect(() => {
		if (!absences || !absences.length) return;

		let filtered = [...absences];

		// Apply excused filter
		if (filterExcused !== "all") {
			filtered = filtered.filter((item) =>
				filterExcused === "excused"
					? item.absence.isExcused
					: !item.absence.isExcused
			);
		}

		// Apply search term
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter((item) => {
				const studentName = item.student
					? `${item.student.firstName} ${item.student.lastName}`.toLowerCase()
					: "";
				const subjectName = item.classLog.subjectName
					? item.classLog.subjectName.toLowerCase()
					: "";
				const reason = item.absence.reason
					? item.absence.reason.toLowerCase()
					: "";

				return (
					studentName.includes(term) ||
					subjectName.includes(term) ||
					reason.includes(term)
				);
			});
		}

		setFilteredAbsences(filtered);

		// Organize by date
		const byDate = {};
		filtered.forEach((absence) => {
			const date = absence.classLog.classDate.split("T")[0];
			if (!byDate[date]) {
				byDate[date] = [];
			}
			byDate[date].push(absence);
		});
		setAbsencesByDate(byDate);
	}, [absences, searchTerm, filterExcused]);

	// Generate attendance data for a selected date
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
				logs: [], // Class logs for this period
				students: {}, // Student attendance status for this period
			};
		}

		// If we have absences for this date, process them
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
				}

				// Add student absence
				if (absence.student) {
					if (!data[period].students[absence.student.id]) {
						data[period].students[absence.student.id] = {
							id: absence.student.id,
							firstName: absence.student.firstName,
							lastName: absence.student.lastName,
							absenceId: absence.absence.id,
							isExcused: absence.absence.isExcused,
							reason: absence.absence.reason || "",
							isPresent: false,
						};
					}
				}
			});
		}

		// Add all students to each period with default present status
		for (let period = 1; period <= periodsCount; period++) {
			// Skip periods with no class logged
			if (data[period].logs.length === 0) continue;

			students.forEach((student) => {
				// If student is not already marked absent, mark as present
				if (!data[period].students[student.id]) {
					data[period].students[student.id] = {
						id: student.id,
						firstName: student.firstName,
						lastName: student.lastName,
						isPresent: true,
						isExcused: false,
						reason: "",
					};
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

	// Handle opening the excuse modal
	const handleExcuseAbsence = (absence) => {
		setSelectedAbsence(absence);
		setIsModalOpen(true);
	};

	// Handle saving excused absence
	const handleSaveExcuse = async (isExcused, reason) => {
		if (!selectedAbsence) return;

		try {
			await updateAbsence(selectedAbsence.absence.id, isExcused, reason);
			setIsModalOpen(false);
			// No need to refresh data as the useAbsences hook will handle updating the state
		} catch (err) {
			console.error("Error updating absence:", err);
		}
	};

	// Format date for display
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

	// Get days in a month
	const getDaysInMonth = (year, month) => {
		return new Date(year, month + 1, 0).getDate();
	};

	// Generate calendar days
	const generateCalendarDays = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const daysInMonth = getDaysInMonth(year, month);

		const firstDayOfMonth = new Date(year, month, 1).getDay();
		const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

		const days = [];
		// Add empty cells for days before the 1st of the month
		for (let i = 0; i < offset; i++) {
			days.push({ day: null, date: null });
		}

		// Add days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			const dateString = date.toISOString().split("T")[0];
			const hasAbsences =
				absencesByDate[dateString] && absencesByDate[dateString].length > 0;
			const isSelected = dateString === selectedDate;

			days.push({
				day,
				date: dateString,
				hasAbsences,
				absenceCount: hasAbsences ? absencesByDate[dateString].length : 0,
				isSelected,
			});
		}

		return days;
	};

	// Navigate to previous month
	const goToPreviousMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		);
	};

	// Navigate to next month
	const goToNextMonth = () => {
		const nextMonth = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth() + 1,
			1
		);
		// Don't allow navigating past the current month
		if (nextMonth <= new Date()) {
			setCurrentMonth(nextMonth);
		}
	};

	// Get current month name
	const getCurrentMonthName = () => {
		return currentMonth.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});
	};

	// Handle selecting a date
	const handleSelectDate = (date) => {
		setSelectedDate(date);
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

	// Get the number of periods for a given date
	const getPeriodsCountForDate = (dateString) => {
		if (!dateString) return 7;
		const date = new Date(dateString);
		const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
		return dayOfWeek === 5 ? 5 : 7; // Friday has 5 periods, other days have 7
	};

	// Generate empty periods array for the selected date
	const generatePeriods = () => {
		if (!selectedDate) return [];

		const periodsCount = getPeriodsCountForDate(selectedDate);
		const periods = [];

		for (let i = 1; i <= periodsCount; i++) {
			periods.push(i);
		}

		return periods;
	};

	// Loading state
	if (loading || studentsLoading) {
		return (
			<div className="attendance-dashboard-card attendance-loading-card">
				<div className="attendance-loading-spinner"></div>
				<p>Loading attendance data...</p>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="attendance-dashboard-card attendance-error-card">
				<FontAwesomeIcon
					icon={faExclamationCircle}
					className="attendance-error-icon"
				/>
				<h3>Error Loading Attendance</h3>
				<p>{error}</p>
				<button
					className="attendance-retry-btn"
					onClick={() => window.location.reload()}
				>
					<FontAwesomeIcon icon={faSync} /> Retry
				</button>
			</div>
		);
	}

	const departmentName = getDepartmentName();
	const calendarDays = generateCalendarDays();
	const periods = generatePeriods();

	return (
		<div className="attendance-dashboard-card">
			{/* Header */}
			<div className="attendance-header">
				<div className="attendance-title">
					<h1>Class Attendance</h1>
					<p>{departmentName}</p>
					<div className="attendance-stats">
						<span className="attendance-stat-pill">
							<FontAwesomeIcon icon={faUserGraduate} /> {students.length}{" "}
							Students
						</span>
						<span className="attendance-stat-pill total">
							<FontAwesomeIcon icon={faCalendarAlt} />{" "}
							{Object.keys(absencesByDate).length} Days with Absences
						</span>
						<span className="attendance-stat-pill excused">
							<FontAwesomeIcon icon={faCheckCircle} />{" "}
							{filteredAbsences.filter((a) => a.absence.isExcused).length}{" "}
							Excused
						</span>
						<span className="attendance-stat-pill unexcused">
							<FontAwesomeIcon icon={faTimesCircle} />{" "}
							{filteredAbsences.filter((a) => !a.absence.isExcused).length}{" "}
							Unexcused
						</span>
					</div>
				</div>

				<div className="attendance-search-filter-row">
					<div className="attendance-search-bar">
						<FontAwesomeIcon
							icon={faSearch}
							className="attendance-search-icon"
						/>
						<input
							type="text"
							placeholder="Search students, subjects, or reasons..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						{searchTerm && (
							<button
								className="attendance-clear-search"
								onClick={() => setSearchTerm("")}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						)}
					</div>

					<select
						className="attendance-filter-select"
						value={filterExcused}
						onChange={(e) => setFilterExcused(e.target.value)}
					>
						<option value="all">All Absences</option>
						<option value="excused">Excused Only</option>
						<option value="unexcused">Unexcused Only</option>
					</select>
				</div>
			</div>

			{/* Calendar View */}
			<div className="attendance-calendar-container">
				<div className="attendance-calendar-section">
					<div className="attendance-calendar-header">
						<button
							className="attendance-month-nav-btn"
							onClick={goToPreviousMonth}
						>
							<FontAwesomeIcon icon={faChevronLeft} />
						</button>
						<h3>{getCurrentMonthName()}</h3>
						<button
							className="attendance-month-nav-btn"
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

					<div className="attendance-calendar-grid">
						{/* Weekday headers */}
						<div className="attendance-calendar-weekday">Mon</div>
						<div className="attendance-calendar-weekday">Tue</div>
						<div className="attendance-calendar-weekday">Wed</div>
						<div className="attendance-calendar-weekday">Thu</div>
						<div className="attendance-calendar-weekday">Fri</div>
						<div className="attendance-calendar-weekday">Sat</div>
						<div className="attendance-calendar-weekday">Sun</div>

						{/* Calendar days */}
						{calendarDays.map((dayInfo, index) => (
							<div
								key={index}
								className={`attendance-calendar-day 
                  ${!dayInfo.day ? "empty" : ""} 
                  ${dayInfo.hasAbsences ? "has-absences" : ""} 
                  ${dayInfo.isSelected ? "selected" : ""}`}
								onClick={() =>
									dayInfo.day ? handleSelectDate(dayInfo.date) : null
								}
							>
								{dayInfo.day && (
									<>
										<span className="attendance-day-number">{dayInfo.day}</span>
										{dayInfo.hasAbsences && (
											<span className="attendance-absence-count">
												{dayInfo.absenceCount}
											</span>
										)}
									</>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Day Attendance View */}
				<div className="attendance-day-section">
					{selectedDate ? (
						<>
							<div className="attendance-day-header">
								<h2>
									<FontAwesomeIcon icon={faCalendarDay} />{" "}
									{formatDate(selectedDate)}
								</h2>
								<div className="attendance-day-actions">
									<select
										className="attendance-filter-day-select"
										onChange={(e) => setSelectedDate(e.target.value)}
										value={selectedDate}
									>
										<option value="">Select a day</option>
										{Object.keys(absencesByDate)
											.sort()
											.map((date) => (
												<option key={date} value={date}>
													{formatDate(date)} ({absencesByDate[date].length}{" "}
													absences)
												</option>
											))}
									</select>
								</div>
							</div>

							<div className="attendance-periods-container">
								{periods.map((period) => {
									const periodData = attendanceData[period] || {
										logs: [],
										students: {},
									};
									const hasClass = periodData.logs.length > 0;
									const sortedStudents = hasClass
										? sortStudents(periodData.students)
										: [];
									const absentCount = hasClass
										? sortedStudents.filter((s) => !s.isPresent).length
										: 0;

									return (
										<div
											key={period}
											className={`attendance-period-block ${
												!hasClass ? "no-class" : ""
											}`}
										>
											<div className="attendance-period-header">
												<h3>
													<FontAwesomeIcon icon={faClock} /> Period {period}
												</h3>
												{hasClass ? (
													<div className="attendance-period-meta">
														<div className="attendance-subject-info">
															<span className="attendance-subject-name">
																<FontAwesomeIcon icon={faBook} />{" "}
																{periodData.logs[0].subjectName}
															</span>
															<span className="attendance-lecture-title">
																<FontAwesomeIcon icon={faChalkboardTeacher} />{" "}
																{periodData.logs[0].lectureTitle}
															</span>
														</div>
														<div className="attendance-period-stats">
															<span className="attendance-present-count">
																<FontAwesomeIcon icon={faCheckCircle} />{" "}
																{sortedStudents.length - absentCount} Present
															</span>
															<span className="attendance-absent-count">
																<FontAwesomeIcon icon={faTimesCircle} />{" "}
																{absentCount} Absent
															</span>
														</div>
													</div>
												) : (
													<span className="attendance-no-class-text">
														No class recorded
													</span>
												)}
											</div>

											{hasClass && (
												<div className="attendance-student-grid">
													{sortedStudents.map((student) => {
														// Determine if this student is absent or present
														const isAbsent = !student.isPresent;

														return (
															<div
																key={student.id}
																className={`attendance-student-card ${
																	isAbsent ? "absent" : "present"
																} ${
																	isAbsent && student.isExcused ? "excused" : ""
																}`}
															>
																<div className="attendance-student-info">
																	<span className="attendance-student-name">
																		{student.lastName}, {student.firstName}
																	</span>
																	{isAbsent && (
																		<span
																			className={`attendance-status-badge ${
																				student.isExcused
																					? "excused"
																					: "unexcused"
																			}`}
																		>
																			{student.isExcused
																				? "Excused"
																				: "Unexcused"}
																		</span>
																	)}
																</div>

																{isAbsent && (
																	<div className="attendance-student-actions">
																		{student.isExcused && student.reason && (
																			<span
																				className="attendance-reason-text"
																				title={student.reason}
																			>
																				{student.reason.length > 25
																					? student.reason.substring(0, 25) +
																					  "..."
																					: student.reason}
																			</span>
																		)}
																		<button
																			className="attendance-excuse-btn"
																			onClick={() => {
																				// Create a full absence object to pass to the modal
																				const absenceObject = {
																					student: {
																						id: student.id,
																						firstName: student.firstName,
																						lastName: student.lastName,
																					},
																					absence: {
																						id: student.absenceId,
																						isExcused: student.isExcused,
																						reason: student.reason || "",
																					},
																					classLog: {
																						id: periodData.logs[0].id,
																						classDate: selectedDate,
																						period: period.toString(),
																						subjectId:
																							periodData.logs[0].subjectId,
																						subjectName:
																							periodData.logs[0].subjectName,
																						lectureTitle:
																							periodData.logs[0].lectureTitle,
																					},
																				};
																				handleExcuseAbsence(absenceObject);
																			}}
																		>
																			<FontAwesomeIcon icon={faEdit} />{" "}
																			{student.isExcused ? "Edit" : "Excuse"}
																		</button>
																	</div>
																)}
															</div>
														);
													})}
												</div>
											)}
										</div>
									);
								})}
							</div>
						</>
					) : (
						<div className="attendance-no-selection">
							<div className="attendance-no-selection-icon">
								<FontAwesomeIcon icon={faCalendarAlt} />
							</div>
							<h3>Select a Day</h3>
							<p>
								Click on a day in the calendar to view class attendance details
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Excuse modal */}
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
