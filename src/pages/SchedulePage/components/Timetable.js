import React, { useState } from "react";
import { useTimetable } from "../hooks/useTimetable";
import "../styles/Timetable.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Timetable = () => {
	const { timetable } = useTimetable();
	const [groupBy, setGroupBy] = useState("Teacher");

	const groupedData = timetable.reduce((acc, entry) => {
		const key = entry[groupBy];
		if (!acc[key]) acc[key] = [];
		acc[key].push(entry);
		return acc;
	}, {});

	return (
		<div className="timetable-container">
			<div className="group-selector">
				<label htmlFor="groupBy">Group by:</label>
				<select
					id="groupBy"
					value={groupBy}
					onChange={(e) => setGroupBy(e.target.value)}
				>
					<option value="Teacher">Teacher</option>
					<option value="DepartmentId">Department</option>
					<option value="Grade">Grade</option>
				</select>
			</div>

			<div className="grouped-timetables">
				{Object.keys(groupedData).map((group) => (
					<div key={group} className="group-card">
						<h2 className="group-title">
							{groupBy}: <span>{group}</span>
						</h2>
						<div className="day-cards">
							{days.map((day) => {
								const dayData = groupedData[group].filter(
									(entry) => entry.Day === day
								);
								const maxPeriods = day === "Friday" ? 5 : 7;

								return (
									<div key={day} className="day-card">
										<h3>{day}</h3>
										<div className="periods">
											{Array.from({ length: maxPeriods }).map((_, period) => {
												const periodData = dayData.find(
													(entry) => entry.Period === period + 1
												);
												return (
													<div
														key={`${day}-${period}`}
														className={`period ${
															periodData ? "filled" : "empty"
														}`}
													>
														{periodData ? (
															<>
																<div className="subject">
																	{periodData.Subject}
																</div>
																<div className="details">
																	<span>{periodData.Teacher}</span>
																	<span>{periodData.Grade}</span>
																</div>
															</>
														) : (
															<span className="no-class">No Class</span>
														)}
													</div>
												);
											})}
										</div>
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

export default Timetable;
