import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import "./SidebarButton.css";

const DesktopSidebarButton = ({ title, icon, route, isActive, onClick }) => {
	const navigate = useNavigate();
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedSubRoute, setSelectedSubRoute] = useState(null);
	const dropdownRef = useRef(null);

	const handleClick = () => {
		if (Array.isArray(route)) {
			if (route.length === 1) {
				handleSubItemClick(route[0].path); // Navigate directly for a single item
			} else {
				setIsExpanded((prev) => !prev);
			}
		} else {
			onClick();
			navigate(route);
		}
	};

	const handleSubItemClick = (subRoute) => {
		setSelectedSubRoute(subRoute);
		navigate(subRoute);
		onClick();
		setIsExpanded(false); // Collapse the dropdown after selection
	};

	// Close dropdown if clicked outside
	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsExpanded(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, []);

	return (
		<div className="desktop-sidebar-button-container" ref={dropdownRef}>
			<div
				className={`desktop-sidebar-button ${isActive ? "active" : ""}`}
				onClick={handleClick}
			>
				<FontAwesomeIcon icon={icon} className="button-icon" />
				<span className="button-title">{title}</span>
				{Array.isArray(route) && route.length > 1 && (
					<FontAwesomeIcon
						icon={isExpanded ? faChevronUp : faChevronDown}
						className="chevron-icon"
					/>
				)}
			</div>
			{isExpanded && Array.isArray(route) && route.length > 1 && (
				<div className="dropdown">
					{route.map((subRoute) => (
						<div
							key={subRoute.title}
							className={`dropdown-item ${
								selectedSubRoute === subRoute.path ? "selected" : ""
							}`}
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
