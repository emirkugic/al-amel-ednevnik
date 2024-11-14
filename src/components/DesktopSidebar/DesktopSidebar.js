import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
	faChartLine,
	faCog,
	faQuestionCircle,
	faSignOutAlt,
	faHouse,
	faPeopleGroup,
	faClock,
	faBookOpen,
	faBook,
} from "@fortawesome/free-solid-svg-icons";
import DesktopSidebarButton from "../ui/DesktopSidebarButton/DesktopSidebarButton";
import useAuth from "../../hooks/useAuth"; // Import useAuth hook
import "./DesktopSidebar.css";

const DesktopSidebar = () => {
	const location = useLocation();
	const { logout } = useAuth(); // Access logout function from useAuth
	const [activeItem, setActiveItem] = useState("");

	const menuItems = [
		{ title: "Dashboard", icon: faHouse, route: "/" },
		{ title: "Students", icon: faPeopleGroup, route: "/students" },
		{
			title: "Courses",
			icon: faBook,
			route: [
				{ title: "Math", path: "/courses/math" },
				{ title: "Physics", path: "/courses/physics" },
				{ title: "Comp Sci", path: "/courses/compsci" },
			],
		},
		{ title: "Attendance", icon: faClock, route: "/attendance" },
		{ title: "Grades", icon: faChartLine, route: "/grades" },
		{
			title: "Lectures",
			icon: faBookOpen,
			route: [
				{ title: "7th grade", path: "/lectures" },
				{ title: "8th grade", path: "/lectures" },
				{ title: "9th grade", path: "/lectures" },
				{ title: "10th grade", path: "/lectures" },
				{ title: "11th grade", path: "/lectures" },
				{ title: "12th grade", path: "/lectures" },
			],
		},
		{ title: "Settings", icon: faCog, route: "/settings" },
		{ title: "Help", icon: faQuestionCircle, route: "/help" },
	];

	useEffect(() => {
		// Find the menu item based on the current path
		const activeMenuItem = menuItems.find((item) =>
			Array.isArray(item.route)
				? item.route.some((sub) => sub.path === location.pathname)
				: item.route === location.pathname
		);

		// If a matching item is found, set it as active
		if (activeMenuItem) {
			setActiveItem(activeMenuItem.title);
		}
	}, [location.pathname]);

	const handleButtonClick = (title) => {
		setActiveItem(title);
	};

	const handleLogout = () => {
		logout(); // Call the logout function from AuthContext
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
					onClick={handleLogout} // Call handleLogout on click
				/>
			</div>
		</div>
	);
};

export default DesktopSidebar;
