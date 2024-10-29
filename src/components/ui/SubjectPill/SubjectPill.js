import React from "react";
import { useNavigate } from "react-router-dom";
import "./SubjectPill.css";

const SubjectPill = ({ color, title }) => {
	const navigate = useNavigate();

	const handleClick = () => {
		const subjectPath = title.toLowerCase().replace(/\s+/g, "-"); // Convert title to lowercase and replace spaces with hyphens
		navigate(`/courses/${subjectPath}`);
	};

	return (
		<div
			className="subject-pill"
			style={{ backgroundColor: color }}
			onClick={handleClick}
		>
			<span className="subject-pill-title">{title}</span>
		</div>
	);
};

export default SubjectPill;
