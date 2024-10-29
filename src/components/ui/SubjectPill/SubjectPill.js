import React from "react";
import "./SubjectPill.css";

const SubjectPill = ({ color, title }) => {
	return (
		<div className="subject-pill" style={{ backgroundColor: color }}>
			<span className="subject-pill-title">{title}</span>
		</div>
	);
};

export default SubjectPill;
