import React, { useState } from "react";
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

const Sidebar = () => {
	const [activeItem, setActiveItem] = useState("Dashboard"); // Default active item
	const [isMenuOpen, setIsMenuOpen] = useState(false); // To toggle mobile menu

	const menuItems = [
		{ name: "Dashboard", icon: faHouse },
		{ name: "Students", icon: faPeopleGroup },
		{ name: "Courses", icon: faBookOpen },
		{ name: "Schedule", icon: faCalendarAlt },
		{ name: "Attendance", icon: faClock },
		{ name: "Grades", icon: faChartLine },
		{ name: "Settings", icon: faCog },
		{ name: "Help", icon: faQuestionCircle },
	];

	const handleItemClick = (itemName) => {
		console.log(`${itemName} clicked`); // Log to console
		setActiveItem(itemName); // Set the clicked item as active
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
						onClick={() => handleItemClick(item.name)}
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
					onClick={() => handleItemClick("Logout")}
				>
					<FontAwesomeIcon icon={faSignOutAlt} /> Logout
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
