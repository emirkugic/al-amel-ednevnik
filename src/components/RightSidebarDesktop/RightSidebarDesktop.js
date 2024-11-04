import React from "react";
import "./RightSidebarDesktop.css";
import CalendarWidget from "../CalendarWidget/CalendarWidget";
import TimetableWidget from "../TimetableWidget/TimetableWidget";

const RightSidebarDesktop = () => {
	return (
		<div className="right-sidebar-desktop">
			<CalendarWidget />
			<TimetableWidget />
		</div>
	);
};

export default RightSidebarDesktop;
