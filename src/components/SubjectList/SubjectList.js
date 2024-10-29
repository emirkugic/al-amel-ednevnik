import React from "react";
import "./SubjectList.css";
import SubjectPill from "../ui/SubjectPill/SubjectPill";

const SubjectList = () => {
	const courses = [
		{ title: "Mathematics", color: "#3498db" },
		{ title: "Physics", color: "#e74c3c" },
		{ title: "Computer Science", color: "#2ecc71" },
		{ title: "History", color: "#f39c12" },
		{ title: "Chemistry", color: "#9b59b6" },
	];

	return (
		<div className="subject-list">
			{courses.map((course, index) => (
				<SubjectPill key={index} color={course.color} title={course.title} />
			))}
		</div>
	);
};

export default SubjectList;
