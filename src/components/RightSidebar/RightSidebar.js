import React from "react";
import "./RightSidebar.css";
import CalendarWidget from "../CalendarWidget/CalendarWidget";
import TimetableWidget from "../TimetableWidget/TimetableWidget";

const RightSidebar = () => {
	return (
		<div className="right-sidebar">
			<CalendarWidget />
			<TimetableWidget />
		</div>
	);
};

export default RightSidebar;
