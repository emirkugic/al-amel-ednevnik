import React, { useState } from "react";
import { useTimetable } from "../hooks/useTimetable";
import { DndContext } from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import "../styles/Timetable.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Timetable = () => {
	const { timetable, updateTimetable } = useTimetable();
	const [viewMode, setViewMode] = useState("Grouped");

	// Get unique teachers for combined view
	const teachers = Array.from(new Set(timetable.map((entry) => entry.Teacher)));

	// Data grouped by day for combined view
	const dataByDay = days.reduce((acc, day) => {
		acc[day] = timetable.filter((entry) => entry.Day === day);
		return acc;
	}, {});

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (!over) return;

		const [activeDay, activePeriod, activeTeacher] = active.id.split("-");
		const [overDay, overPeriod, overTeacher] = over.id.split("-");

		if (
			activeDay === overDay &&
			activePeriod === overPeriod &&
			activeTeacher === overTeacher
		)
			return;

		const updatedTimetable = [...timetable];
		const draggedSubject = updatedTimetable.find(
			(entry) =>
				entry.Day === activeDay &&
				entry.Period === parseInt(activePeriod) &&
				entry.Teacher === activeTeacher
		);

		if (draggedSubject) {
			draggedSubject.Day = overDay;
			draggedSubject.Period = parseInt(overPeriod);
			draggedSubject.Teacher = overTeacher;
		}

		updateTimetable(updatedTimetable);
	};

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

			{viewMode === "Combined" && (
				<DndContext onDragEnd={handleDragEnd}>
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
												const cellId = `${day}-${i + 1}-${teacher}`;
												const periodData = dataByDay[day].find(
													(entry) =>
														entry.Teacher === teacher && entry.Period === i + 1
												);
												return (
													<DroppableCell
														key={cellId}
														id={cellId}
														periodData={periodData}
													/>
												);
											});
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</DndContext>
			)}
		</div>
	);
};

const DroppableCell = ({ id, periodData }) => {
	const { setNodeRef: droppableRef, isOver } = useDroppable({ id });

	return (
		<td
			ref={droppableRef}
			className={`cell ${
				periodData ? "filled" : isOver ? "empty-hover" : "empty"
			}`}
		>
			{periodData ? (
				<DraggableSubject
					id={id}
					subject={periodData.Subject}
					grade={periodData.Grade}
				/>
			) : (
				"-"
			)}
		</td>
	);
};

const DraggableSubject = ({ id, subject, grade }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

	const style = {
		transform: transform
			? `translate(${transform.x}px, ${transform.y}px)`
			: undefined,
		userSelect: "none",
		zIndex: transform ? 10 : "auto",
		position: transform ? "absolute" : "relative",
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="draggable"
		>
			<div className="subject">{subject}</div>
			<div className="details">{grade}</div>
		</div>
	);
};

export default Timetable;
