import React from "react";
import SubjectPill from "../ui/SubjectPill/SubjectPill";
import "./SubjectList.css";

const SubjectList = () => {
	const courses = [
		{ title: "Mathematics", color: "#3498db" },
		{ title: "Physics", color: "#e74c3c" },
		{ title: "Computer Science", color: "#2ecc71" },
		{ title: "History", color: "#f39c12" },
		{ title: "Chemistry", color: "#9b59b6" },
	];

	const handlePillClick = (title) => {
		console.log(`You clicked on: ${title}`);
	};

	return (
		<div className="subject-list">
			{courses.map((course, index) => (
				<SubjectPill
					key={index}
					color={course.color}
					title={course.title}
					onClick={handlePillClick}
				/>
			))}
		</div>
	);
};

export default SubjectList;
