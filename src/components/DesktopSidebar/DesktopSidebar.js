import React, { useState } from "react";
import {
	faChartLine,
	faCog,
	faQuestionCircle,
	faSignOutAlt,
	faHouse,
	faPeopleGroup,
	faClock,
	faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import DesktopSidebarButton from "../ui/DesktopSidebarButton/DesktopSidebarButton";
import "./DesktopSidebar.css";

const DesktopSidebar = () => {
	const [activeItem, setActiveItem] = useState("Dashboard");

	const menuItems = [
		{ title: "Dashboard", icon: faHouse, route: "/" },
		{ title: "Students", icon: faPeopleGroup, route: "/students" },
		{
			title: "Courses",
			icon: faBookOpen,
			route: [
				{ title: "Math", path: "/courses/math" },
				{ title: "Physics", path: "/courses/physics" },
				{ title: "Comp Sci", path: "/courses/compsci" },
			],
		},
		// { title: "Schedule", icon: faCalendarAlt, route: "/schedule" },
		{ title: "Attendance", icon: faClock, route: "/attendance" },
		{ title: "Grades", icon: faChartLine, route: "/grades" },
		{ title: "Lectures", icon: faBookOpen, route: "/lectures" },
		{ title: "Settings", icon: faCog, route: "/settings" },
		{ title: "Help", icon: faQuestionCircle, route: "/help" },
	];

	const handleButtonClick = (title) => {
		setActiveItem(title);
	};

	return (
		<div className="desktop-sidebar">
			<div className="sidebar-menu">
				{menuItems.map((item) => (
					<DesktopSidebarButton
						key={item.title}
						title={item.title}
						icon={item.icon}
						route={item.route}
						isActive={activeItem === item.title}
						onClick={() => handleButtonClick(item.title)}
					/>
				))}
			</div>
			<div className="logout-container">
				<DesktopSidebarButton
					title="Logout"
					icon={faSignOutAlt}
					route="/login"
					isActive={false}
					onClick={() => handleButtonClick("Logout")}
				/>
			</div>
		</div>
	);
};

export default DesktopSidebar;
