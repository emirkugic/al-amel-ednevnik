import React, { useState } from "react";
import GradesList from "../ui/GradesList/GradesList";
import ClassLogForm from "../ClassLogForm/ClassLogForm";

const Dashboard = () => {
	// Initial selected semester state
	const [selectedSemester, setSelectedSemester] = useState("First");

	// Semester data
	const semesters = {
		First: [
			{
				subject: "Mathematics",
				teacher: "Dr. Smith",
				details: [
					{ exam: "1st Exam", grade: 90, date: "2024-09-15" },
					{ exam: "2nd Exam", grade: 25, date: "2024-09-20" },
					{ exam: "Oral Exam", grade: 95, date: "2024-09-25" },
					{ exam: "Final Exam", grade: 91, date: "2024-11-10" },
					{ exam: "Final Exam2", grade: 92, date: "2024-11-11" },
					{ exam: "Final Exam3", grade: 93, date: "2024-11-12" },
					{ exam: "Final Exam4", grade: 94, date: "2024-11-13" },
					{ exam: "Final Exam5", grade: 95, date: "2024-11-14" },
					{ exam: "Final Exam6", grade: 96, date: "2024-11-15" },
					{ exam: "More grades", grade: 96, date: "2024-12-15" },
					{ exam: "More grades2", grade: 96, date: "2024-12-15" },
					{ exam: "More grades3", grade: 96, date: "2024-12-15" },
					{ exam: "More grades4", grade: 96, date: "2024-12-15" },
					{ exam: "More grades5", grade: 96, date: "2024-12-15" },
					{ exam: "More grades6", grade: 96, date: "2024-12-15" },
					{ exam: "More grades7", grade: 96, date: "2024-12-15" },
					{ exam: "January grades", grade: 96, date: "2024-1-15" },
					{ exam: "January grades2", grade: 96, date: "2024-1-15" },
					{ exam: "January grades3", grade: 96, date: "2024-1-15" },
					{ exam: "January grades4", grade: 96, date: "2024-1-15" },
					{ exam: "January grades5", grade: 96, date: "2024-1-15" },
					{ exam: "January grades6", grade: 96, date: "2024-1-15" },
					{ exam: "January grades7", grade: 96, date: "2024-1-15" },
				],
			},
			{
				subject: "Physics",
				teacher: "Mrs. Johnson",
				details: [
					{ exam: "1st Exam", grade: 85, date: "2024-09-18" },
					{ exam: "Oral Exam", grade: 90, date: "2024-10-10" },
					{ exam: "Final Exam", grade: 89, date: "2024-11-20" },
				],
			},
		],
		Second: [
			{
				subject: "Mathematics",
				teacher: "Dr. Smith",
				details: [
					{ exam: "1st Exam", grade: 89, date: "2025-01-15" },
					{ exam: "Oral Exam", grade: 93, date: "2025-02-10" },
					{ exam: "Final Exam", grade: 92, date: "2025-03-12" },
				],
			},
			{
				subject: "Chemistry",
				teacher: "Dr. Brown",
				details: [
					{ exam: "1st Exam", grade: 89, date: "2025-01-20" },
					{ exam: "Oral Exam", grade: 92, date: "2025-02-15" },
					{ exam: "Final Exam", grade: 90, date: "2025-03-20" },
				],
			},
		],
	};

	return (
		<div>
			{/* <h2>Dashboard</h2>
			<p>Welcome to the Dashboard</p>
			<br />
			<br />
			<br /> */}

			{/* Render the Classlogform component */}
			<ClassLogForm />

			{/* Render the GradesList outside the modal */}
			{/* <GradesList subjects={semesters[selectedSemester]} /> */}
		</div>
	);
};

export default Dashboard;
