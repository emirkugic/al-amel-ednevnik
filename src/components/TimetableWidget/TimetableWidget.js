import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import "./TimetableWidget.css";

const TimetableWidget = () => {
	const { t } = useLanguage();
	const today = new Date();
	const isWinter = false; // Summer timetable is active starting April 7
	const isFriday = today.getDay() === 5;

	const [mode] = useState(isWinter ? "Winter" : "Summer");
	const [subMode] = useState(isFriday ? "Friday" : "Monday to Thursday");
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);
		return () => clearInterval(timer);
	}, []);

	// Get translated label for each timetable entry
	const getTranslatedLabel = (labelKey) => {
		switch (labelKey) {
			case "1st Period":
				return t("timetable.periods.first");
			case "2nd Period":
				return t("timetable.periods.second");
			case "3rd Period":
				return t("timetable.periods.third");
			case "4th Period":
				return t("timetable.periods.fourth");
			case "5th Period":
				return t("timetable.periods.fifth");
			case "6th Period":
				return t("timetable.periods.sixth");
			case "7th Period":
				return t("timetable.periods.seventh");
			case "Break":
				return t("timetable.breaks.main");
			case "Break 2":
				return t("timetable.breaks.second");
			default:
				return labelKey;
		}
	};

	const timetableData = {
		Summer: {
			"Monday to Thursday": [
				{ start: "08:30", end: "09:10", label: "1st Period" },
				{ start: "09:15", end: "09:55", label: "2nd Period" },
				{ start: "10:00", end: "10:40", label: "3rd Period" },
				{ start: "10:40", end: "11:00", label: "Break" },
				{ start: "11:05", end: "11:45", label: "4th Period" },
				{ start: "11:50", end: "12:30", label: "5th Period" },
				{ start: "12:35", end: "13:15", label: "6th Period" },
				{ start: "13:20", end: "13:35", label: "Break 2" },
				{ start: "13:40", end: "14:20", label: "7th Period" },
			],
			Friday: [
				{ start: "08:30", end: "09:10", label: "1st Period" },
				{ start: "09:15", end: "09:55", label: "2nd Period" },
				{ start: "10:00", end: "10:40", label: "3rd Period" },
				{ start: "10:40", end: "11:00", label: "Break" },
				{ start: "11:05", end: "11:45", label: "4th Period" },
				{ start: "11:50", end: "12:30", label: "5th Period" },
			],
		},
	};

	const currentTimetable = timetableData[mode][subMode];

	const isCurrentPeriod = (start, end) => {
		const now = currentTime.getHours() * 60 + currentTime.getMinutes();
		const [startHours, startMinutes] = start.split(":").map(Number);
		const [endHours, endMinutes] = end.split(":").map(Number);
		const startTime = startHours * 60 + startMinutes;
		const endTime = endHours * 60 + endMinutes;

		return now >= startTime && now < endTime;
	};

	return (
		<div className="mtt-widget">
			<div className="mtt-timetable">
				{currentTimetable.map((item, index) => (
					<div
						key={index}
						className={`mtt-row ${
							isCurrentPeriod(item.start, item.end) ? "mtt-current" : ""
						}`}
					>
						<div className="mtt-time">
							{item.start} - {item.end}
						</div>
						<div className="mtt-label">{getTranslatedLabel(item.label)}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default TimetableWidget;
