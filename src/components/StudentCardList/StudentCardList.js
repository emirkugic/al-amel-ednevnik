import React from "react";
import StudentCard from "../StudentCard/StudentCard"; // Import the StudentCard component
import "./StudentCardList.css"; // Import the styles for the list

const StudentCardList = () => {
	// Sample student data
	const students = [
		{
			name: "Emma Thompson",
			id: "STU001",
			class: "Class X",
			gpa: 3.8,
			attendance: "95%",
			grade: "10th Grade",
			imageUrl: `${process.env.PUBLIC_URL}/alamel_logo.png`,
		},
		{
			name: "John Doe",
			id: "STU002",
			class: "Class X",
			gpa: 3.5,
			attendance: "93%",
			grade: "10th Grade",
			imageUrl: `${process.env.PUBLIC_URL}/alamel_logo.png`,
		},
		{
			name: "Sarah Connor",
			id: "STU003",
			class: "Class X",
			gpa: 3.9,
			attendance: "97%",
			grade: "10th Grade",
			imageUrl: `${process.env.PUBLIC_URL}/alamel_logo.png`,
		},
		// Add more students as needed
	];

	return (
		<div className="student-card-list">
			{students.map((student, index) => (
				<StudentCard
					key={index}
					name={student.name}
					id={student.id}
					className={student.class}
					gpa={student.gpa}
					attendance={student.attendance}
					grade={student.grade}
					imageUrl={student.imageUrl}
				/>
			))}
		</div>
	);
};

export default StudentCardList;
