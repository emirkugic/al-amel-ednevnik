import React, { useState, useEffect } from "react";
import useAllClassLogs from "../hooks/useAllClassLogs";
import useDepartments from "../../../hooks/useDepartments";
import useTeachers from "../../../hooks/useTeachers";
import useAuth from "../../../hooks/useAuth";
import WeeklyLogsControls from "./WeeklyLogsControls";
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

	// Track screen size for mobile
	const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Build weekdays array
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

	const weekdays = [];
	const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
	for (let i = 0; i < 5; i++) {
		const dayDate = new Date(mondayOffset);
		dayDate.setDate(mondayOffset.getDate() + i);
		weekdays.push({
			name: dayNames[i],
			date: dayDate,
			dateFormatted: dayDate.toISOString().split("T")[0],
			periodCount: i === 4 ? 5 : 7,
		});
	}

	// ----- Mobile: track which weekday index is selected -----
	// For example, 0 => Monday, 1 => Tuesday, ...
	const [selectedDayIndex, setSelectedDayIndex] = useState(0);

	// On mount or when weekdays change, see if we can pick a better default
	useEffect(() => {
		const todayFormatted = today.toISOString().split("T")[0];
		// If "today" is within this week's Mon-Fri, select that weekday's index
		const foundIndex = weekdays.findIndex(
			(wd) => wd.dateFormatted === todayFormatted
		);
		if (foundIndex !== -1) {
			setSelectedDayIndex(foundIndex);
		} else {
			// If "today" not in these 5 days (e.g., weekend or different offset),
			// just keep existing index. If it's out of range, reset to 0.
			if (selectedDayIndex < 0 || selectedDayIndex > 4) {
				setSelectedDayIndex(0);
			}
		}
	}, [weekOffset, weekdays]);

	// Filter logs for a given date & period
	const getLogsFor = (dateFormatted, period) => {
		return classLogs.filter((log) => {
			const logDate = new Date(log.classDate).toISOString().split("T")[0];
			const matchesDate = logDate === dateFormatted;
			const matchesPeriod = Number(log.period) === period;
			const matchesDept = log.departmentId === selectedDepartment;
			return matchesDate && matchesPeriod && matchesDept;
		});
	};

	// Teacher name helper
	const getTeacherName = (teacherId) => {
		const teacher = teachers.find((t) => t.id === teacherId);
		return teacher ? teacher.firstName.split(" ")[0] : teacherId;
	};

	// Department & Week controls
	const onDepartmentChange = (deptId) => setSelectedDepartment(deptId);
	const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
	const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
	const disableNext = weekOffset >= 0;

	// Initialize department if needed
	useEffect(() => {
		if (!selectedDepartment && departments && departments.length > 0) {
			setSelectedDepartment(departments[0].id);
		}
	}, [departments, selectedDepartment]);

	if (logsLoading || depsLoading || teachersLoading)
		return <div className="loading">Loading weekly logs...</div>;
	if (logsError)
		return <div className="error">Error (logs): {logsError.message}</div>;
	if (depsError)
		return (
			<div className="error">Error (departments): {depsError.message}</div>
		);
	if (teachersError)
		return (
			<div className="error">Error (teachers): {teachersError.message}</div>
		);

	// Decide which days to render:
	// - Desktop => all 5 days
	// - Mobile => just the day at selectedDayIndex
	const daysToRender = isMobile
		? [weekdays[selectedDayIndex]] // single day
		: weekdays; // all days

	return (
		<div className="weekly-logs">
			{/* 1) Our new controls component */}
			<WeeklyLogsControls
				departments={departments}
				selectedDepartment={selectedDepartment}
				onDepartmentChange={onDepartmentChange}
				isMobile={isMobile}
				weekdays={weekdays}
				selectedDayIndex={selectedDayIndex}
				setSelectedDayIndex={setSelectedDayIndex}
				handlePrevWeek={handlePrevWeek}
				handleNextWeek={handleNextWeek}
				disableNext={disableNext}
				mondayOffset={mondayOffset}
				weekOffset={weekOffset}
			/>

			{/* 2) The timetable */}
			<div className="timetable">
				{daysToRender.map((day, idx) => (
					<div className="timetable-row" key={day.dateFormatted || idx}>
						<div className="day-label">
							<div className="day-name">{day.name}</div>
							<div className="date">{day.dateFormatted}</div>
						</div>
						<div className="periods">
							{Array.from({ length: day.periodCount }, (_, periodIndex) => {
								const period = periodIndex + 1;
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
		</div>
	);
};

export default WeeklyLogs;
