import React, { useState, useEffect } from "react";
import useAllClassLogs from "../hooks/useAllClassLogs";
import useDepartments from "../../../hooks/useDepartments";
import useTeachers from "../../../hooks/useTeachers";
import useAuth from "../../../hooks/useAuth";
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

	// Only allow individual departments.
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [weekOffset, setWeekOffset] = useState(0);

	useEffect(() => {
		if (!selectedDepartment && departments && departments.length > 0) {
			setSelectedDepartment(departments[0].id);
		}
	}, [departments, selectedDepartment]);

	// Get Monday for any given date.
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

	// Build weekdays array (Mon–Fri) with abbreviated day name, ISO date, and period count.
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

	// Helper: Filter logs for a given date and period.
	const getLogsFor = (dateFormatted, period) => {
		return classLogs.filter((log) => {
			const logDate = new Date(log.classDate).toISOString().split("T")[0];
			const matchesDate = logDate === dateFormatted;
			const matchesPeriod = Number(log.period) === period;
			const matchesDept = log.departmentId === selectedDepartment;
			return matchesDate && matchesPeriod && matchesDept;
		});
	};

	// Helper: Return teacher's first name (first word only).
	const getTeacherName = (teacherId) => {
		const teacher = teachers.find((t) => t.id === teacherId);
		return teacher ? teacher.firstName.split(" ")[0] : teacherId;
	};

	const handleDepartmentChange = (e) => setSelectedDepartment(e.target.value);
	const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
	const handleNextWeek = () => setWeekOffset((prev) => prev + 1);

	// Disable the Next button if the user would move into a future week.
	const disableNext = weekOffset >= 0;

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

	return (
		<div className="weekly-logs">
			{/* Header */}
			<div className="header">
				<div className="header-left">
					<label className="dept-label" htmlFor="deptSelect">
						Select Department
					</label>
					<select
						id="deptSelect"
						className="dept-select"
						value={selectedDepartment}
						onChange={handleDepartmentChange}
					>
						{departments.map((dept) => (
							<option key={dept.id} value={dept.id}>
								{dept.departmentName}
							</option>
						))}
					</select>
				</div>
				<div className="header-right">
					<button className="week-btn" onClick={handlePrevWeek}>
						&larr;
					</button>
					<span className="week-label">
						Week of {mondayOffset.toLocaleDateString()}
					</span>
					<button
						className="week-btn"
						onClick={handleNextWeek}
						disabled={disableNext}
					>
						&rarr;
					</button>
				</div>
			</div>

			{/* Timetable Grid */}
			<div className="timetable">
				{weekdays.map((day) => (
					<div className="timetable-row" key={day.dateFormatted}>
						<div className="day-label">
							<div className="day-name">{day.name}</div>
							<div className="date">{day.dateFormatted}</div>
						</div>
						<div className="periods">
							{Array.from({ length: day.periodCount }, (_, index) => {
								const period = index + 1;
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
												{/* Optionally, you can display the first log's title as well */}
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
