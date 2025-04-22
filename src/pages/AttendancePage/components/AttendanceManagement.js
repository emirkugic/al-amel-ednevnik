import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSearch,
	faCalendarAlt,
	faCheckCircle,
	faTimesCircle,
	faEdit,
	faChevronLeft,
	faChevronRight,
	faExclamationTriangle,
	faExclamationCircle,
	faSync,
	faCalendarDay,
	faFilter,
	faUsers,
	faCheck,
	faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import useAuth from "../../../hooks/useAuth";
import useClassTeacher from "../../../hooks/useClassTeacher";
import useAbsences from "../../../hooks/useAbsences";
import useStudents from "../../../hooks/useStudents";
import useDepartments from "../../../hooks/useDepartments";
import useSubjects from "../../../hooks/useSubjects";
import useAttendanceManagement from "../hooks/useAttendanceManagement";
import AttendanceExcuseModal from "./AttendanceExcuseModal";
import "./AttendanceManagement.css";

const AttendanceManagement = () => {
	// Original data hooks
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

	// Use our new attendance management hook
	const attendance = useAttendanceManagement(
		absences,
		students,
		departments,
		subjects,
		updateAbsence,
		departmentId,
		loading,
		studentsLoading,
		error
	);

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

	const departmentName = attendance.getDepartmentName();
	const calendarDays = attendance.generateCalendarDays();

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
							<div className="count-value">
								{attendance.absenceCounts.total}
							</div>
							<div className="count-label">Total</div>
						</div>
						<div className="absence-count">
							<div className="count-value count-unhandled">
								{attendance.absenceCounts.unhandled}
							</div>
							<div className="count-label">Unhandled</div>
						</div>
						<div className="absence-count">
							<div className="count-value count-excused">
								{attendance.absenceCounts.excused}
							</div>
							<div className="count-label">Excused</div>
						</div>
						<div className="absence-count">
							<div className="count-value count-unexcused">
								{attendance.absenceCounts.unexcused}
							</div>
							<div className="count-label">Unexcused</div>
						</div>
					</div>
				</div>

				{/* Calendar */}
				<div className="calendar-container">
					<div className="calendar-header">
						<span className="month-name">{attendance.formatMonthYear()}</span>
						<div className="month-nav">
							<button
								className="month-nav-btn"
								onClick={attendance.goToPreviousMonth}
							>
								<FontAwesomeIcon icon={faChevronLeft} />
							</button>
							<button
								className="month-nav-btn"
								onClick={attendance.goToNextMonth}
								disabled={
									new Date(
										attendance.currentMonth.getFullYear(),
										attendance.currentMonth.getMonth() + 1,
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
								onClick={() => day.day && attendance.setSelectedDate(day.date)}
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
							attendance.selectedFilter === "all" ? "active" : ""
						}`}
						onClick={() => attendance.handleFilterSelect("all")}
					>
						<FontAwesomeIcon icon={faFilter} className="filter-icon" />
						<span className="filter-text">All Absences</span>
						<span className="filter-count">
							{attendance.absenceCounts.total}
						</span>
					</div>

					<div
						className={`filter-option ${
							attendance.selectedFilter === "unhandled" ? "active" : ""
						}`}
						onClick={() => attendance.handleFilterSelect("unhandled")}
					>
						<FontAwesomeIcon
							icon={faExclamationTriangle}
							className="filter-icon"
						/>
						<span className="filter-text">Unhandled</span>
						<span className="filter-count">
							{attendance.absenceCounts.unhandled}
						</span>
					</div>

					<div
						className={`filter-option ${
							attendance.selectedFilter === "excused" ? "active" : ""
						}`}
						onClick={() => attendance.handleFilterSelect("excused")}
					>
						<FontAwesomeIcon icon={faCheckCircle} className="filter-icon" />
						<span className="filter-text">Excused</span>
						<span className="filter-count">
							{attendance.absenceCounts.excused}
						</span>
					</div>

					<div
						className={`filter-option ${
							attendance.selectedFilter === "unexcused" ? "active" : ""
						}`}
						onClick={() => attendance.handleFilterSelect("unexcused")}
					>
						<FontAwesomeIcon icon={faTimesCircle} className="filter-icon" />
						<span className="filter-text">Unexcused</span>
						<span className="filter-count">
							{attendance.absenceCounts.unexcused}
						</span>
					</div>

					<div className="search-container">
						<FontAwesomeIcon icon={faSearch} className="search-icon" />
						<input
							type="text"
							className="search-input"
							placeholder="Search students or subjects..."
							value={attendance.searchTerm}
							onChange={(e) => attendance.setSearchTerm(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="attendance-main">
				{attendance.selectedDate ? (
					<>
						{/* Header with selected date and actions */}
						<div className="main-header">
							<div className="selected-date">
								<FontAwesomeIcon icon={faCalendarDay} className="date-icon" />
								{attendance.formatDate(attendance.selectedDate)}
							</div>

							<div className="action-buttons">
								{attendance.absenceCounts.unhandled > 0 && (
									<>
										<button
											className="action-button primary-button"
											onClick={() => attendance.handleExcuseAllUnhandled(true)}
										>
											<FontAwesomeIcon icon={faCheckCircle} /> Excuse All
											Unhandled
										</button>
										<button
											className="action-button warning-button"
											onClick={() => attendance.handleExcuseAllUnhandled(false)}
										>
											<FontAwesomeIcon icon={faTimesCircle} /> Mark All as
											Unexcused
										</button>
									</>
								)}

								<button
									className="action-button secondary-button"
									onClick={attendance.toggleSelectMode}
								>
									<FontAwesomeIcon icon={faUsers} />
									{attendance.isSelectMode
										? "Cancel Selection"
										: "Select Multiple"}
								</button>
							</div>
						</div>

						{/* Absences content */}
						<div className="absences-container">
							{/* If there are periods with classes */}
							{Object.entries(attendance.attendanceData).some(
								([_, data]) => data.hasClass
							) ? (
								<div className="period-list">
									{Object.entries(attendance.attendanceData)
										.filter(([_, data]) => data.hasClass)
										.map(([period, data]) => {
											const sortedStudents = attendance.sortStudents(
												data.students
											);
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

													{attendance.isSelectMode &&
														absentStudents.length > 0 && (
															<div className="period-actions">
																<button
																	className="action-button secondary-button"
																	onClick={() => {
																		// Select/deselect all absent students in this period
																		const newSelected = {
																			...attendance.selectedStudents,
																		};
																		const allSelected = absentStudents.every(
																			(s) =>
																				attendance.selectedStudents[
																					`${s.id}-${period}`
																				]
																		);

																		absentStudents.forEach((s) => {
																			newSelected[`${s.id}-${period}`] =
																				!allSelected;
																		});

																		attendance.setSelectedStudents(newSelected);
																	}}
																>
																	<FontAwesomeIcon icon={faCheck} />
																	{absentStudents.every(
																		(s) =>
																			attendance.selectedStudents[
																				`${s.id}-${period}`
																			]
																	)
																		? "Deselect All"
																		: "Select All Absent"}
																</button>

																{attendance.countSelectedStudents() > 0 && (
																	<>
																		<button
																			className="action-button primary-button"
																			onClick={() =>
																				attendance.handleBatchExcuse(true)
																			}
																		>
																			<FontAwesomeIcon icon={faCheckCircle} />
																			Excuse Selected (
																			{attendance.countSelectedStudents()})
																		</button>
																		<button
																			className="action-button warning-button"
																			onClick={() =>
																				attendance.handleBatchExcuse(false)
																			}
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
															const isSelected =
																attendance.selectedStudents[key];

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
																		{attendance.isSelectMode && (
																			<input
																				type="checkbox"
																				className="student-checkbox"
																				checked={!!isSelected}
																				onChange={() =>
																					attendance.handleStudentSelect(
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

																		{!attendance.isSelectMode && (
																			<button
																				className="handle-button"
																				onClick={() => {
																					attendance.handleExcuseAbsence({
																						student,
																						absence: {
																							id: student.absenceId,
																							isExcused: student.isExcused,
																							reason: student.reason || "",
																						},
																						classLog: {
																							id: data.logs[0]?.id,
																							classDate:
																								attendance.selectedDate,
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
			{attendance.isModalOpen && attendance.selectedAbsence && (
				<AttendanceExcuseModal
					absence={attendance.selectedAbsence}
					onClose={() => attendance.setIsModalOpen(false)}
					onSave={attendance.handleSaveExcuse}
				/>
			)}
		</div>
	);
};

export default AttendanceManagement;
