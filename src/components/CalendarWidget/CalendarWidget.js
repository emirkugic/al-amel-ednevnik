import React, { useState } from "react";
import "./CalendarWidget.css";

const CalendarWidget = () => {
	const [currentDate, setCurrentDate] = useState(new Date());

	const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const getDaysInMonth = (date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		return new Date(year, month + 1, 0).getDate();
	};

	const handlePreviousMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
		);
	};

	const handleNextMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
		);
	};

	const renderDays = () => {
		const days = [];
		const firstDayOfMonth = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			1
		).getDay();
		const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
		const daysInMonth = getDaysInMonth(currentDate);

		for (let i = 0; i < startDay; i++) {
			days.push(
				<div key={`empty-${i}`} className="mtc-calendar-day mtc-empty"></div>
			);
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const isToday =
				new Date().toDateString() ===
				new Date(
					currentDate.getFullYear(),
					currentDate.getMonth(),
					day
				).toDateString();
			days.push(
				<div
					key={day}
					className={`mtc-calendar-day ${isToday ? "mtc-today" : ""}`}
				>
					{day}
				</div>
			);
		}

		return days;
	};

	return (
		<div className="mtc-calendar-widget">
			<div className="mtc-calendar-header">
				<button onClick={handlePreviousMonth} className="mtc-arrow-button">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M15 18L9 12L15 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
				<span>
					{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
				</span>
				<button onClick={handleNextMonth} className="mtc-arrow-button">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M9 18L15 12L9 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>
			<div className="mtc-calendar-days">
				{daysOfWeek.map((day) => (
					<div key={day} className="mtc-calendar-day-header">
						{day}
					</div>
				))}
				{renderDays()}
			</div>
		</div>
	);
};

export default CalendarWidget;
