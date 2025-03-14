import React, { useState, useEffect, useMemo, useRef } from "react";
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
import useClassLogDetails from "../../../hooks/useClassLogDetails";
import classLogApi from "../../../api/classLogApi";

// Import modal components
import ClassLogFormModal from "../../../components/ClassLogFormModal/ClassLogFormModal";
import LogDetailsModal from "../../../components/LogDetailsModal/LogDetailsModal";
import EditLogModal from "../../../components/EditLogModal/EditLogModal";

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
		refetchLogs,
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

	// Add a ref to track if we've already set the initial day
	const initialDaySet = useRef(false);

	// State for log details modal
	const [selectedLogId, setSelectedLogId] = useState(null);
	const [initialLogTitle, setInitialLogTitle] = useState("");
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [currentRequestId, setCurrentRequestId] = useState(null);

	// State for edit log modal
	const [showEditModal, setShowEditModal] = useState(false);
	const [logToEdit, setLogToEdit] = useState(null);

	// Use the custom hook to fetch log details when a log ID is selected
	const {
		logDetails,
		loading: detailsLoading,
		error: detailsError,
		refetchDetails,
	} = useClassLogDetails(selectedLogId);

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

	// Set selected day to today on FIRST LOAD ONLY
	useEffect(() => {
		// Skip if we've already set the initial day
		if (initialDaySet.current) return;

		const todayIndex = weekdays.findIndex((day) => day.isToday);
		if (todayIndex !== -1) {
			setSelectedDayIndex(todayIndex);
			// Mark that we've set the initial day
			initialDaySet.current = true;
		}
	}, [weekdays]);

	// Reset selectedDayIndex when changing week to avoid out-of-bounds issues
	useEffect(() => {
		// If we're changing weeks, set to first day
		if (selectedDayIndex >= weekdays.length) {
			setSelectedDayIndex(0);
		}
	}, [weekOffset, weekdays.length, selectedDayIndex]);

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

	// Handler for mobile day selection
	const handleDaySelection = (e) => {
		setSelectedDayIndex(Number(e.target.value));
	};

	// Handler for clicking on a log entry
	const handleLogClick = (log) => {
		// First, close any open modal
		setShowDetailsModal(false);

		// Force a re-render cycle to clear any previous data
		setSelectedLogId(null);

		// Generate a new request ID
		const requestId = Date.now().toString();
		setCurrentRequestId(requestId);

		// Set the initial title from the basic log info
		setInitialLogTitle(log.lectureTitle);

		// Very brief timeout to ensure state is cleared before proceeding
		setTimeout(() => {
			// Open the modal with loading state
			setShowDetailsModal(true);

			// Set the ID to trigger the data fetch
			setSelectedLogId(log.id || log.classLogId);
		}, 10);
	};

	// Handler for closing the details modal
	const handleCloseDetailsModal = () => {
		setShowDetailsModal(false);
		setSelectedLogId(null);
		setInitialLogTitle("");
		setCurrentRequestId(null);
	};

	// Handler for editing a log
	const handleEditLog = (log) => {
		// Prepare the log data for edit
		const formattedLog = {
			...log,
			classLogId: log.classLogId || log.id,
			// Ensure we keep the original teacherId and departmentId
			teacherId: log.teacherId,
			departmentId: log.departmentId,
			// Make sure we have absentStudents property formatted correctly
			absentStudents: log.absentStudents || [],
		};

		// Set the log to edit
		setLogToEdit(formattedLog);

		// Close the details modal and open the edit modal
		setShowDetailsModal(false);
		setShowEditModal(true);
	};

	// Handler for updating a log
	const handleUpdateLog = (updatedLog) => {
		// Close the edit modal first
		setShowEditModal(false);

		// Format the updated log to match the expected structure in our UI
		const formattedUpdatedLog = {
			...updatedLog,
			id: updatedLog.id || updatedLog.classLogId,
			classLogId: updatedLog.classLogId || updatedLog.id,
			subject:
				updatedLog.subject ||
				subjects.find((s) => s.id === updatedLog.subjectId)?.subjectName ||
				"",
			teacherName: getTeacherName(updatedLog.teacherId),
		};

		console.log("Updated log:", formattedUpdatedLog);

		setAllLogs((prevLogs) =>
			prevLogs.map((log) =>
				log.id === formattedUpdatedLog.id ||
				log.classLogId === formattedUpdatedLog.classLogId
					? { ...log, ...formattedUpdatedLog }
					: log
			)
		);

		refetchLogs();
	};

	// Handler for deleting a log
	const handleDeleteLog = async (logId) => {
		if (!window.confirm("Are you sure you want to delete this log?")) {
			return;
		}

		try {
			await classLogApi.deleteClassLog(logId, token);

			// Remove the deleted log from the state
			setAllLogs((prev) =>
				prev.filter((log) => log.id !== logId && log.classLogId !== logId)
			);

			// Close the modal
			handleCloseDetailsModal();
		} catch (error) {
			console.error("Error deleting class log:", error);
			alert("Failed to delete class log. Please try again.");
		}
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
							<select value={selectedDayIndex} onChange={handleDaySelection}>
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
														<div
															className="log-entry"
															onClick={() => handleLogClick(logs[0])}
														>
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

			{/* Log Details Modal */}
			<LogDetailsModal
				isOpen={showDetailsModal}
				onClose={handleCloseDetailsModal}
				onEdit={handleEditLog}
				onDelete={handleDeleteLog}
				detailedLog={logDetails}
				loadingDetails={detailsLoading}
				errorDetails={detailsError}
				initialTitle={initialLogTitle}
				requestId={currentRequestId}
			/>

			{/* Edit Log Modal */}
			{showEditModal && logToEdit && (
				<EditLogModal
					log={logToEdit}
					onClose={() => setShowEditModal(false)}
					handleUpdateLog={handleUpdateLog}
				/>
			)}
		</div>
	);
};

export default WeeklyLogs;
