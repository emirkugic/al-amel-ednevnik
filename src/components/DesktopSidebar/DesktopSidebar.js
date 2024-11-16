import React, { useState, useEffect, useMemo } from "react";
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
	faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import DesktopSidebarButton from "../ui/DesktopSidebarButton/DesktopSidebarButton";
import useAuth from "../../hooks/useAuth";
import "./DesktopSidebar.css";

const DesktopSidebar = () => {
	const location = useLocation();
	const { user, logout } = useAuth();
	const [activeItem, setActiveItem] = useState("");

	const menuItems = useMemo(() => {
		const items = [
			{ title: "Dashboard", icon: faHouse, route: "/" },
			{ title: "Students", icon: faPeopleGroup, route: "/students" },
			{
				title: "My Courses",
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

		// Conditionally add the "Teachers" button for admins
		if (user?.role === "Admin") {
			items.push(
				{
					title: "Teachers",
					icon: faChalkboardTeacher,
					route: "/teachers",
				},
				{
					title: "Subjects",
					icon: faBook,
					route: "/subjects",
				}
			);
		}

		return items;
	}, [user]);

	useEffect(() => {
		const activeMenuItem = menuItems.find((item) =>
			Array.isArray(item.route)
				? item.route.some((sub) => sub.path === location.pathname)
				: item.route === location.pathname
		);

		if (activeMenuItem) {
			setActiveItem(activeMenuItem.title);
		}
	}, [location.pathname, menuItems]);

	const handleButtonClick = (title) => {
		setActiveItem(title);
	};

	const handleLogout = () => {
		logout();
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
					onClick={handleLogout}
				/>
			</div>
		</div>
	);
};

export default DesktopSidebar;
