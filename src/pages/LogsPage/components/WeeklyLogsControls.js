import React from "react";
import "./WeeklyLogsControls.css";
import useAuth from "../../../hooks/useAuth"; // so we can read user.role & assignedSubjects

const WeeklyLogsControls = ({
	departments,
	selectedDepartment,
	onDepartmentChange,
	isMobile,
	weekdays,
	selectedDayIndex,
	setSelectedDayIndex,
	handlePrevWeek,
	handleNextWeek,
	disableNext,
	mondayOffset,
}) => {
	const { user, assignedSubjects } = useAuth();
	const isAdmin = user?.role === "Admin";

	// If admin, show ALL departments; if teacher, filter them
	let teacherDepartments = departments;
	if (!isAdmin) {
		const teacherDeptIds = new Set();
		if (assignedSubjects && assignedSubjects.length > 0) {
			assignedSubjects.forEach((as) => {
				as.departmentId.forEach((depId) => teacherDeptIds.add(depId));
			});
		}
		teacherDepartments = departments.filter((dept) =>
			teacherDeptIds.has(dept.id)
		);
	}

	return (
		<div className="weekly-logs-controls">
			<div className="controls-left">
				{/* Department */}
				<div className="control-group">
					<label className="control-label" htmlFor="deptSelect">
						Department
					</label>
					<select
						id="deptSelect"
						className="control-select"
						value={selectedDepartment}
						onChange={(e) => onDepartmentChange(e.target.value)}
					>
						{teacherDepartments.map((dept) => (
							<option key={dept.id} value={dept.id}>
								{dept.departmentName}
							</option>
						))}
					</select>
				</div>

				{/* Day selection (mobile only) */}
				{isMobile && (
					<div className="control-group">
						<label className="control-label" htmlFor="mobileDaySelect">
							Day
						</label>
						<select
							id="mobileDaySelect"
							className="control-select"
							value={selectedDayIndex}
							onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
						>
							{weekdays.map((wd, i) => (
								<option key={wd.dateFormatted} value={i}>
									{wd.name} ({wd.dateFormatted})
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			<div className="controls-right">
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
	);
};

export default WeeklyLogsControls;
