import React from "react";
import "./WeeklyLogsControls.css";

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
						{departments.map((dept) => (
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

			{/* Week Navigation */}
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
