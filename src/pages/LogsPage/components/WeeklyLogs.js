import React, { useState } from "react";
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
		refetch: refetchLogs,
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

	const [selectedDepartment, setSelectedDepartment] = useState("all");
	const [weekOffset, setWeekOffset] = useState(0);

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
	const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
	for (let i = 0; i < 5; i++) {
		const dayDate = new Date(mondayOffset);
		dayDate.setDate(mondayOffset.getDate() + i);
		weekdays.push({
			name: dayNames[i],
			date: dayDate,
			dateFormatted: dayDate.toISOString().split("T")[0],
			periodCount: dayNames[i] === "Friday" ? 5 : 7,
		});
	}

	// Helper: Filter logs for a given date (YYYY-MM-DD) and period.
	const getLogsFor = (dateFormatted, period) => {
		return classLogs.filter((log) => {
			const logDate = new Date(log.classDate);
			const logDateFormatted = logDate.toISOString().split("T")[0];
			const matchesDate = logDateFormatted === dateFormatted;
			const matchesPeriod = Number(log.period) === period;
			const matchesDept =
				selectedDepartment === "all" || log.departmentId === selectedDepartment;
			return matchesDate && matchesPeriod && matchesDept;
		});
	};

	// Helper: Given a teacherId, find and return the teacher's full name.
	const getTeacherName = (teacherId) => {
		const teacher = teachers.find((t) => t.id === teacherId);
		return teacher ? `${teacher.firstName} ${teacher.lastName}` : teacherId;
	};

	const handleDepartmentChange = (e) => {
		setSelectedDepartment(e.target.value);
	};

	const handlePrevWeek = () => {
		setWeekOffset((prev) => prev - 1);
	};

	const handleNextWeek = () => {
		setWeekOffset((prev) => prev + 1);
	};

	if (logsLoading || depsLoading || teachersLoading)
		return <div>Loading weekly logs...</div>;
	if (logsError) return <div>Error (logs): {logsError.message}</div>;
	if (depsError) return <div>Error (departments): {depsError.message}</div>;
	if (teachersError)
		return <div>Error (teachers): {teachersError.message}</div>;

	return (
		<div className="weekly-logs">
			{/* Controls for department selection and week navigation */}
			<div className="controls">
				<label>
					Department:{" "}
					<select value={selectedDepartment} onChange={handleDepartmentChange}>
						<option value="all">All Departments</option>
						{departments.map((dept) => (
							<option key={dept.id} value={dept.id}>
								{dept.departmentName}
							</option>
						))}
					</select>
				</label>
				<button onClick={handlePrevWeek}>Previous Week</button>
				<button onClick={handleNextWeek}>Next Week</button>
				<span className="week-label">
					Week of {mondayOffset.toLocaleDateString()}
				</span>
			</div>

			{/* Timetable grid */}
			<div className="timetable">
				{weekdays.map((day) => (
					<div className="timetable-row" key={day.dateFormatted}>
						{/* Day label cell */}
						<div className="day-label">
							<strong>{day.name}</strong>
							<br />
							{day.dateFormatted}
						</div>
						{/* Period cells for the day */}
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
									<div className="period-label">Period {period}</div>
									{logsForCell.length === 0 ? (
										<div className="no-log">Missing</div>
									) : (
										<div className="logs">
											{logsForCell.map((log, i) => (
												<div key={i} className="log-entry">
													<div className="lecture-title">
														{log.lectureTitle}
													</div>
													<div className="log-details">
														Seq: {log.sequence} | Teacher:{" "}
														{getTeacherName(log.teacherId)}
													</div>
												</div>
											))}
											{logsForCell.length > 1 && (
												<div className="duplicate-indicator">
													Duplicate logs!
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};

export default WeeklyLogs;
