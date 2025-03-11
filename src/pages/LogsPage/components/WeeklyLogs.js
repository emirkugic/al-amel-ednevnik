import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChevronLeft,
	faChevronRight,
	faExclamationCircle,
	faSync,
	faInfoCircle,
	faUser,
} from "@fortawesome/free-solid-svg-icons";

// Import hooks
import useAllClassLogs from "../hooks/useAllClassLogs";
import useDepartments from "../../../hooks/useDepartments";
import useTeachers from "../../../hooks/useTeachers";
import useSubjects from "../../../hooks/useSubjects";
import useAuth from "../../../hooks/useAuth";

// Import modal component
import ClassLogFormModal from "../../../components/ClassLogFormModal/ClassLogFormModal";

// Import styling
import "./WeeklyLogs.css";

const WeeklyLogs = () => {
	const { user, assignedSubjects } = useAuth();
	const token = user?.token;

	// Fetch data using hooks
	const {
		classLogs,
		loading: logsLoading,
		error: logsError,
	} = useAllClassLogs(token);
	const {
		departments,
		loading: depsLoading,
		error: depsError,
	} = useDepartments(token);
	const {
		teachers,
		loading: teachersLoading,
		error: teachersError,
	} = useTeachers(token);
	const {
		subjects,
		loading: subjectsLoading,
		error: subjectsError,
	} = useSubjects(token);

	// State management
	const [allLogs, setAllLogs] = useState([]);
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [weekOffset, setWeekOffset] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [missingDate, setMissingDate] = useState("");
	const [missingPeriod, setMissingPeriod] = useState("");
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [selectedDayIndex, setSelectedDayIndex] = useState(0);

	// Update logs when data is loaded
	useEffect(() => {
		if (!logsLoading && classLogs) {
			setAllLogs(classLogs);
		}
	}, [classLogs, logsLoading]);

	// Set up responsive behavior
	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Filter departments based on user role
	const filteredDepartments = useMemo(() => {
		if (!departments) return [];
		if (user?.role === "Admin") return departments;

		const teacherDeptIds = new Set();
		if (assignedSubjects && assignedSubjects.length > 0) {
			assignedSubjects.forEach((as) => {
				as.departmentId.forEach((depId) => teacherDeptIds.add(depId));
			});
		}
		return departments.filter((dept) => teacherDeptIds.has(dept.id));
	}, [departments, assignedSubjects, user]);

	// Set default department when departments are loaded
	useEffect(() => {
		if (!selectedDepartment && filteredDepartments.length > 0) {
			setSelectedDepartment(filteredDepartments[0].id);
		}
	}, [filteredDepartments, selectedDepartment]);

	// Week calculation
	const getMonday = (d) => {
		const date = new Date(d);
		const day = date.getDay() || 7;
		if (day !== 1) {
			date.setDate(date.getDate() - day + 1);
		}
		return date;
	};

	const today = new Date();
	const currentMonday = getMonday(today);
	const mondayOffset = new Date(currentMonday);
	mondayOffset.setDate(currentMonday.getDate() + weekOffset * 7);

	// Generate weekdays array
	const weekdays = [];
	const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
	const shortDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

	for (let i = 0; i < 5; i++) {
		const dayDate = new Date(mondayOffset);
		dayDate.setDate(mondayOffset.getDate() + i);
		weekdays.push({
			name: dayNames[i],
			shortName: shortDayNames[i],
			date: dayDate,
			dateFormatted: dayDate.toISOString().split("T")[0],
			periodCount: i === 4 ? 5 : 7, // Friday has 5 periods, other days have 7
			isToday: dayDate.toDateString() === today.toDateString(),
		});
	}

	// Set selected day to today on first load
	useEffect(() => {
		const todayIndex = weekdays.findIndex((day) => day.isToday);
		if (todayIndex !== -1) {
			setSelectedDayIndex(todayIndex);
		}
	}, [weekdays]);

	// Helper functions
	const getLogsFor = (dateFormatted, period) => {
		return allLogs.filter((log) => {
			const logDate = new Date(log.classDate).toISOString().split("T")[0];
			return (
				logDate === dateFormatted &&
				Number(log.period) === period &&
				log.departmentId === selectedDepartment
			);
		});
	};

	const getTeacherName = (teacherId) => {
		const teacher = teachers?.find((t) => t.id === teacherId);
		return teacher ? teacher.firstName.split(" ")[0] : "Unknown";
	};

	const getDepartmentName = (deptId) => {
		const dept = departments?.find((d) => d.id === deptId);
		return dept ? dept.departmentName : "";
	};

	// Navigation handlers
	const handlePrevWeek = () => {
		setWeekOffset((prev) => prev - 1);
	};

	const handleNextWeek = () => {
		if (weekOffset >= 0) return; // Don't navigate to future weeks
		setWeekOffset((prev) => prev + 1);
	};

	const handleCurrentWeek = () => {
		setWeekOffset(0);
	};

	// Event handlers
	const handleDepartmentChange = (e) => setSelectedDepartment(e.target.value);

	const handleNewLogCreated = (newLog) => {
		setAllLogs((prev) => [...prev, newLog]);
		setShowModal(false);
	};

	const handleAddMissingLog = (date, period) => {
		setMissingDate(date);
		setMissingPeriod(period.toString());
		setShowModal(true);
	};

	// Determine which days to render based on viewport
	const daysToRender = isMobile ? [weekdays[selectedDayIndex]] : weekdays;

	// Format date for header display
	const formatWeekRange = () => {
		const startDate = new Date(mondayOffset);
		const endDate = new Date(mondayOffset);
		endDate.setDate(startDate.getDate() + 4); // Friday

		const options = { month: "short", day: "numeric" };
		return `${startDate.toLocaleDateString(
			"en-US",
			options
		)} - ${endDate.toLocaleDateString("en-US", options)}${
			weekOffset === 0 ? " (Current Week)" : ""
		}`;
	};

	// Check if any data is still loading
	const isLoading =
		logsLoading || depsLoading || teachersLoading || subjectsLoading;

	// Check for any errors
	const hasError = logsError || depsError || teachersError || subjectsError;
	const errorMessage =
		logsError?.message ||
		depsError?.message ||
		teachersError?.message ||
		subjectsError?.message;

	// Loading state
	if (isLoading) {
		return (
			<div className="timetable-container">
				<div className="timetable-loading">
					<div className="loading-spinner"></div>
					<p>Loading timetable...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (hasError) {
		return (
			<div className="timetable-container">
				<div className="timetable-error">
					<FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
					<h3>Error Loading Data</h3>
					<p>{errorMessage}</p>
					<button
						className="btn-retry"
						onClick={() => window.location.reload()}
					>
						<FontAwesomeIcon icon={faSync} /> Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="timetable-container">
			<div className="timetable-header">
				<div className="header-left">
					<h2>Class Logs</h2>
					<div className="week-selector">
						<button className="btn-nav" onClick={handlePrevWeek}>
							<FontAwesomeIcon icon={faChevronLeft} />
						</button>

						<span className="week-range">{formatWeekRange()}</span>

						<button
							className={`btn-nav ${weekOffset >= 0 ? "disabled" : ""}`}
							onClick={handleNextWeek}
							disabled={weekOffset >= 0}
						>
							<FontAwesomeIcon icon={faChevronRight} />
						</button>

						{weekOffset !== 0 && (
							<button className="btn-today" onClick={handleCurrentWeek}>
								Today
							</button>
						)}
					</div>
				</div>

				<div className="header-right">
					<div className="dept-selector">
						<select
							value={selectedDepartment}
							onChange={handleDepartmentChange}
						>
							{filteredDepartments.map((dept) => (
								<option key={dept.id} value={dept.id}>
									{dept.departmentName}
								</option>
							))}
						</select>
					</div>

					{isMobile && (
						<div className="day-selector">
							<select
								value={selectedDayIndex}
								onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
							>
								{weekdays.map((day, idx) => (
									<option key={day.dateFormatted} value={idx}>
										{day.name} {day.isToday ? "(Today)" : ""}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>

			<div className="timetable">
				{/* Days Headers */}
				{!isMobile && (
					<div className="timetable-days-header">
						<div className="period-label">Period</div>
						{weekdays.map((day) => (
							<div
								key={day.dateFormatted}
								className={`day-header ${day.isToday ? "today" : ""}`}
							>
								<div className="day-name">{day.shortName}</div>
								<div className="day-date">
									{new Date(day.date).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									})}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Mobile Day Header */}
				{isMobile && (
					<div className="mobile-day-header">
						<div className="mobile-day-info">
							<div className="day-name">{daysToRender[0].name}</div>
							<div className="day-date">
								{new Date(daysToRender[0].date).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
								{daysToRender[0].isToday && (
									<span className="today-badge">Today</span>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Period Rows */}
				<div className="periods-container">
					{Array.from(
						{ length: isMobile ? daysToRender[0].periodCount : 7 },
						(_, periodIndex) => {
							const period = periodIndex + 1;

							return (
								<div key={`period-${period}`} className="period-row">
									<div className="period-label">P{period}</div>

									<div className="day-cells">
										{(isMobile ? daysToRender : weekdays).map((day) => {
											// Skip rendering periods beyond this day's count
											if (period > day.periodCount) return null;

											const logs = getLogsFor(day.dateFormatted, period);
											const hasDuplicates = logs.length > 1;
											const isMissing = logs.length === 0;

											return (
												<div
													key={`${day.dateFormatted}-${period}`}
													className={`day-cell ${isMissing ? "missing" : ""} ${
														hasDuplicates ? "duplicate" : ""
													} ${day.isToday ? "today" : ""}`}
												>
													{isMissing ? (
														<div
															className="missing-log"
															onClick={() =>
																handleAddMissingLog(day.dateFormatted, period)
															}
														>
															<span className="add-icon">+</span>
															<span>Add</span>
														</div>
													) : (
														<div className="log-entry">
															<div
																className="log-title"
																title={logs[0].lectureTitle}
															>
																{logs[0].lectureTitle}
															</div>
															<div className="log-details">
																<span className="sequence">
																	#{logs[0].sequence}
																</span>
																<span className="teacher">
																	<FontAwesomeIcon icon={faUser} />
																	{getTeacherName(logs[0].teacherId)}
																</span>
															</div>
															{hasDuplicates && (
																<div
																	className="duplicate-indicator"
																	title={`Multiple entries (${
																		logs.length
																	}): ${logs
																		.map(
																			(log) =>
																				`${log.lectureTitle} (${getTeacherName(
																					log.teacherId
																				)})`
																		)
																		.join(", ")}`}
																>
																	<FontAwesomeIcon icon={faInfoCircle} />
																	<span>{logs.length}</span>
																</div>
															)}
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							);
						}
					)}
				</div>
			</div>

			{/* Class Log Form Modal */}
			{showModal && (
				<ClassLogFormModal
					onClose={() => setShowModal(false)}
					departmentId={selectedDepartment}
					disableDayAndPeriodSelection={true}
					externalDate={missingDate}
					externalPeriod={missingPeriod}
					onSuccess={handleNewLogCreated}
					subjects={subjects}
				/>
			)}
		</div>
	);
};

export default WeeklyLogs;
