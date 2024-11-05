import React from "react";
import LoggedClassesOverview from "../LoggedClassesOverview/LoggedClassesOverview";

const Grades = () => {
	const classLogs = [
		{
			date: "2024-11-01",
			period: "1st Period",
			lectureTitle: "Introduction to Algebra",
			sequence: "1 / 40",
			attendance: { present: 28, total: 30, absent: 2 },
			absentStudents: ["John Doe", "Jane Smith"],
		},
		{
			date: "2024-11-02",
			period: "2nd Period",
			lectureTitle: "Linear Equations",
			sequence: "2 / 40",
			attendance: { present: 30, total: 30, absent: 0 },
			absentStudents: [],
		},
		{
			date: "2024-11-03",
			period: "3rd Period",
			lectureTitle: "Quadratic Equations",
			sequence: "3 / 40",
			attendance: { present: 29, total: 30, absent: 1 },
			absentStudents: ["Alice Brown"],
		},
		// Additional data for more classes
		{
			date: "2024-11-04",
			period: "1st Period",
			lectureTitle: "Polynomials",
			sequence: "4 / 40",
			attendance: { present: 27, total: 30, absent: 3 },
			absentStudents: ["Sam Wilson", "Chris Evans", "Natalie Portman"],
		},
		{
			date: "2024-11-05",
			period: "2nd Period",
			lectureTitle: "Functions and Graphs",
			sequence: "5 / 40",
			attendance: { present: 28, total: 30, absent: 2 },
			absentStudents: ["Robert Downey", "Scarlett Johansson"],
		},
		{
			date: "2024-11-06",
			period: "3rd Period",
			lectureTitle: "Exponential Functions",
			sequence: "6 / 40",
			attendance: { present: 26, total: 30, absent: 4 },
			absentStudents: [
				"Mark Ruffalo",
				"Chris Hemsworth",
				"Tom Hiddleston",
				"Benedict Cumberbatch",
			],
		},
		{
			date: "2024-11-07",
			period: "1st Period",
			lectureTitle: "Logarithmic Functions",
			sequence: "7 / 40",
			attendance: { present: 30, total: 30, absent: 0 },
			absentStudents: [],
		},
		{
			date: "2024-11-08",
			period: "2nd Period",
			lectureTitle: "Sequences and Series",
			sequence: "8 / 40",
			attendance: { present: 29, total: 30, absent: 1 },
			absentStudents: ["Chris Pratt"],
		},
		{
			date: "2024-11-09",
			period: "3rd Period",
			lectureTitle: "Probability",
			sequence: "9 / 40",
			attendance: { present: 28, total: 30, absent: 2 },
			absentStudents: ["Paul Rudd", "Jeremy Renner"],
		},
		{
			date: "2024-11-10",
			period: "1st Period",
			lectureTitle: "Statistics",
			sequence: "10 / 40",
			attendance: { present: 30, total: 30, absent: 0 },
			absentStudents: [],
		},
		// Add more entries as needed
	];

	return (
		<div>
			<LoggedClassesOverview initialLogs={classLogs} />
		</div>
	);
};

export default Grades;
