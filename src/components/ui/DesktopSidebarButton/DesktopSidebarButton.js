import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import "./DesktopSidebarButton.css";

const DesktopSidebarButton = ({ title, icon, route, isActive, onClick }) => {
	const navigate = useNavigate();
	const [isExpanded, setIsExpanded] = useState(false);

	const handleClick = () => {
		if (Array.isArray(route)) {
			setIsExpanded(!isExpanded);
		} else {
			onClick();
			navigate(route);
		}
	};

	const handleSubItemClick = (subRoute) => {
		navigate(subRoute);
		onClick();
		setIsExpanded(false); // Collapse the dropdown
	};

	return (
		<div className="desktop-sidebar-button-container">
			<div
				className={`desktop-sidebar-button ${isActive ? "active" : ""}`}
				onClick={handleClick}
			>
				<FontAwesomeIcon icon={icon} className="button-icon" />
				<span className="button-title">{title}</span>
				{Array.isArray(route) && (
					<FontAwesomeIcon
						icon={isExpanded ? faChevronUp : faChevronDown}
						className="chevron-icon"
					/>
				)}
			</div>
			{isExpanded && Array.isArray(route) && (
				<div className="dropdown">
					{route.map((subRoute) => (
						<div
							key={subRoute.title}
							className="dropdown-item"
							onClick={() => handleSubItemClick(subRoute.path)}
						>
							{subRoute.title}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default DesktopSidebarButton;
