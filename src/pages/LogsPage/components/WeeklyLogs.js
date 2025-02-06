import React, { useState, useEffect } from "react";
import useAllClassLogs from "../hooks/useAllClassLogs";
import useDepartments from "../../../hooks/useDepartments";
import useTeachers from "../../../hooks/useTeachers";
import useAuth from "../../../hooks/useAuth";
import WeeklyLogsControls from "./WeeklyLogsControls";

// Import the Swiper for mobile
import MobileSwipeDays from "./MobileSwipeDays";

import "./WeeklyLogs.css";

const WeeklyLogs = () => {
	const { user } = useAuth();
	const token = user?.token;

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

	// ---------- STATE ----------
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [weekOffset, setWeekOffset] = useState(0);

	// Detect mobile
	const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// ----- Build the Monday-based week -----
	const getMonday = (d) => {
		const date = new Date(d);
		const day = date.getDay() || 7; // Sunday is 0 in JS, so treat as day 7
		if (day !== 1) {
			date.setDate(date.getDate() - (day - 1));
		}
		return date;
	};

	const today = new Date();
	const currentMonday = getMonday(today);
	const mondayOffset = new Date(currentMonday);
	mondayOffset.setDate(currentMonday.getDate() + weekOffset * 7);

	// Create an array for Mon–Fri
	const weekdays = [];
	const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
	for (let i = 0; i < 5; i++) {
		const dayDate = new Date(mondayOffset);
		dayDate.setDate(mondayOffset.getDate() + i);
		weekdays.push({
			name: dayNames[i],
			date: dayDate,
			dateFormatted: dayDate.toISOString().split("T")[0],
			periodCount: i === 4 ? 5 : 7, // e.g. Friday might have 5
		});
	}

	// ----- If the user hasn’t selected a dept, default to the first. -----
	useEffect(() => {
		if (!selectedDepartment && departments && departments.length > 0) {
			setSelectedDepartment(departments[0].id);
		}
	}, [departments, selectedDepartment]);

	// ----- LOGS HELPERS -----
	const getLogsFor = (dateFormatted, period) => {
		return classLogs.filter((log) => {
			const logDate = new Date(log.classDate).toISOString().split("T")[0];
			return (
				logDate === dateFormatted &&
				Number(log.period) === period &&
				log.departmentId === selectedDepartment
			);
		});
	};

	const getTeacherName = (teacherId) => {
		const teacher = teachers.find((t) => t.id === teacherId);
		return teacher ? teacher.firstName.split(" ")[0] : teacherId;
	};

	// ----- CONTROLS -----
	const handleDepartmentChange = (deptId) => setSelectedDepartment(deptId);
	const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
	const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
	const disableNext = weekOffset >= 0;

	// ----- LOADING/ERROR STATES -----
	if (logsLoading || depsLoading || teachersLoading) {
		return <div className="loading">Loading weekly logs...</div>;
	}
	if (logsError) {
		return <div className="error">Error (logs): {logsError.message}</div>;
	}
	if (depsError) {
		return (
			<div className="error">Error (departments): {depsError.message}</div>
		);
	}
	if (teachersError) {
		return (
			<div className="error">Error (teachers): {teachersError.message}</div>
		);
	}

	return (
		<div className="weekly-logs">
			<WeeklyLogsControls
				departments={departments}
				selectedDepartment={selectedDepartment}
				onDepartmentChange={handleDepartmentChange}
				isMobile={isMobile}
				weekdays={weekdays}
				// day selection / index is now handled inside the mobile swiper
				// so we pass only week stuff
				handlePrevWeek={handlePrevWeek}
				handleNextWeek={handleNextWeek}
				disableNext={disableNext}
				mondayOffset={mondayOffset}
			/>

			{!isMobile && (
				<div className="timetable">
					{/** DESKTOP: Show all 5 days in your usual layout */}
					{weekdays.map((day) => (
						<div className="timetable-row" key={day.dateFormatted}>
							<div className="day-label">
								<div className="day-name">{day.name}</div>
								<div className="date">{day.dateFormatted}</div>
							</div>
							<div className="periods">
								{Array.from({ length: day.periodCount }).map((_, pIndex) => {
									const period = pIndex + 1;
									const logsForCell = getLogsFor(day.dateFormatted, period);

									return (
										<div
											key={period}
											className={`timetable-cell ${
												logsForCell.length === 0 ? "missing" : ""
											}`}
										>
											<div className="cell-header">
												<span className="period-number">P{period}</span>
												{logsForCell.length > 1 && (
													<span
														className="duplicate-label"
														title={logsForCell
															.map(
																(log) =>
																	`Title: ${log.lectureTitle}, Seq: ${
																		log.sequence
																	}, Teacher: ${getTeacherName(log.teacherId)}`
															)
															.join("\n")}
													>
														{" - DUPLICATE"}
													</span>
												)}
											</div>

											{logsForCell.length === 0 ? (
												<div className="cell-content no-log">Missing</div>
											) : logsForCell.length === 1 ? (
												<div
													className="cell-content log-entry"
													title={`Seq: ${
														logsForCell[0].sequence
													} | ${getTeacherName(logsForCell[0].teacherId)}`}
												>
													<div className="lecture-title">
														{logsForCell[0].lectureTitle}
													</div>
													<div className="log-details">
														Seq: {logsForCell[0].sequence} |{" "}
														{getTeacherName(logsForCell[0].teacherId)}
													</div>
												</div>
											) : (
												<div
													className="cell-content log-duplicate"
													title={logsForCell
														.map(
															(log) =>
																`Title: ${log.lectureTitle}, Seq: ${
																	log.sequence
																}, Teacher: ${getTeacherName(log.teacherId)}`
														)
														.join("\n")}
												>
													<div className="lecture-title">
														{logsForCell[0].lectureTitle}
													</div>
													<div className="log-details">
														Seq: {logsForCell[0].sequence} |{" "}
														{getTeacherName(logsForCell[0].teacherId)}
													</div>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			)}

			{isMobile && (
				<MobileSwipeDays
					weekdays={weekdays}
					getLogsFor={getLogsFor}
					getTeacherName={getTeacherName}
				/>
			)}
		</div>
	);
};

export default WeeklyLogs;
