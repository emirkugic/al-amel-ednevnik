import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import the hook for navigation
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendarAlt,
	faChartLine,
	faCog,
	faQuestionCircle,
	faSignOutAlt,
	faHouse,
	faPeopleGroup,
	faClock,
	faBookOpen,
	faBars,
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";
import { faAnchorLock } from "@fortawesome/free-solid-svg-icons/faAnchorLock";

const Sidebar = () => {
	const [activeItem, setActiveItem] = useState("Dashboard"); // Default active item
	const [isMenuOpen, setIsMenuOpen] = useState(false); // To toggle mobile menu
	const navigate = useNavigate(); // Use React Router's navigation hook

	const menuItems = [
		{ name: "Dashboard", icon: faHouse, path: "/" },
		{ name: "Students", icon: faPeopleGroup, path: "/students" },
		{ name: "Courses", icon: faBookOpen, path: "/courses" },
		{ name: "Schedule", icon: faCalendarAlt, path: "/schedule" },
		{ name: "Attendance", icon: faClock, path: "/attendance" },
		{ name: "Grades", icon: faChartLine, path: "/grades" },
		{ name: "Settings", icon: faCog, path: "/settings" },
		{ name: "Help", icon: faQuestionCircle, path: "/help" },
		{ name: "Login", icon: faAnchorLock, path: "/login" },
	];

	const handleItemClick = (item) => {
		setActiveItem(item.name); // Set the clicked item as active
		navigate(item.path); // Navigate to the corresponding path
		if (window.innerWidth <= 768) setIsMenuOpen(false); // Close menu on mobile
	};

	return (
		<div>
			{/* Top bar for mobile view */}
			<div className="top-bar">
				<FontAwesomeIcon
					icon={faBars}
					className="burger-menu"
					onClick={() => setIsMenuOpen(!isMenuOpen)}
				/>
				<div className="brand-title">Al Amel</div>
			</div>

			{/* Sidebar for desktop and mobile */}
			<div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
				{menuItems.map((item) => (
					<div
						key={item.name}
						className={`menu-item ${activeItem === item.name ? "active" : ""}`}
						onClick={() => handleItemClick(item)}
					>
						<FontAwesomeIcon
							icon={item.icon}
							className={activeItem === item.name ? "active-icon" : ""}
						/>
						{item.name}
					</div>
				))}
				<div
					className="menu-item logout"
					onClick={() => handleItemClick({ path: "/" })}
				>
					<FontAwesomeIcon icon={faSignOutAlt} /> Logout
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
