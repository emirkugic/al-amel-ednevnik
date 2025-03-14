import React from "react";
import "./RightSidebar.css";
import CalendarWidget from "../CalendarWidget/CalendarWidget";
import TimetableWidget from "../TimetableWidget/TimetableWidget";

const RightSidebar = () => {
	return (
		<div className="mts-right-sidebar">
			<div className="mts-sidebar-scroll-container">
				<div className="mts-sidebar-calendar-wrapper">
					<CalendarWidget />
				</div>
				<div className="mts-sidebar-timetable-wrapper">
					<TimetableWidget />
				</div>
			</div>
		</div>
	);
};

export default RightSidebar;
	