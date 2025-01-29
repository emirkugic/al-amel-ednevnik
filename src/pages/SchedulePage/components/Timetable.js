import React, { useState } from "react";
import { useTimetable } from "../hooks/useTimetable";
import "../styles/Timetable.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Timetable = () => {
	const { timetable } = useTimetable();
	const [viewMode, setViewMode] = useState("Grouped");

	// Get unique teachers for combined view
	const teachers = Array.from(new Set(timetable.map((entry) => entry.Teacher)));

	// Data grouped by day for combined view
	const dataByDay = days.reduce((acc, day) => {
		acc[day] = timetable.filter((entry) => entry.Day === day);
		return acc;
	}, {});

	return (
		<div className="timetable-container">
			<div className="group-selector">
				<label htmlFor="viewMode">View mode:</label>
				<select
					id="viewMode"
					value={viewMode}
					onChange={(e) => setViewMode(e.target.value)}
				>
					<option value="Grouped">Grouped by</option>
					<option value="Combined">Combined View</option>
				</select>
			</div>

			{viewMode === "Grouped" && (
				<div className="grouped-timetables">
					{/* Grouped view logic remains unchanged */}
					{/* You can copy the previous grouped view implementation here */}
				</div>
			)}

			{viewMode === "Combined" && (
				<div className="combined-view">
					<table className="combined-table">
						<thead>
							<tr>
								<th>Teacher</th>
								{days.map((day) => (
									<th key={day} colSpan={day === "Friday" ? 5 : 7}>
										{day}
									</th>
								))}
							</tr>
							<tr>
								<th></th>
								{days.map((day) => {
									const periods = day === "Friday" ? 5 : 7;
									return Array.from({ length: periods }).map((_, i) => (
										<th key={`${day}-period-${i}`}>{i + 1}</th>
									));
								})}
							</tr>
						</thead>
						<tbody>
							{teachers.map((teacher) => (
								<tr key={teacher}>
									<td className="teacher-cell">{teacher}</td>
									{days.map((day) => {
										const periods = day === "Friday" ? 5 : 7;
										return Array.from({ length: periods }).map((_, i) => {
											const periodData = dataByDay[day].find(
												(entry) =>
													entry.Teacher === teacher && entry.Period === i + 1
											);
											return (
												<td
													key={`${teacher}-${day}-period-${i}`}
													className={periodData ? "filled" : "empty"}
												>
													{periodData ? (
														<>
															<div className="subject">
																{periodData.Subject}
															</div>
															<div className="details">{periodData.Grade}</div>
														</>
													) : (
														"-"
													)}
												</td>
											);
										});
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default Timetable;
