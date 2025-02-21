import React, { useMemo } from "react";
import "./Grades.css";

// Mocked data to simulate fetching from a backend
const mockData = {
	departmentName: "Academic Department",
	subjects: [
		{
			subjectName: "Mathematics",
			subjectCode: "MATH101",
			assessments: [
				{
					name: "Exam 1",
					weight: "30%",
					date: "2025-01-15",
					pointsPossible: 30,
				},
				{
					name: "Homework",
					weight: "20%",
					date: "2025-02-03",
					pointsPossible: 20,
				},
				{
					name: "Final",
					weight: "50%",
					date: "2025-03-10",
					pointsPossible: 50,
				},
			],
			students: [
				{
					studentId: "123",
					firstName: "Alice",
					lastName: "Doe",
					grades: {
						"Exam 1": 28,
						Homework: 20,
						// Final not graded yet
					},
				},
				{
					studentId: "456",
					firstName: "Bob",
					lastName: "Smith",
					grades: {
						"Exam 1": 25,
						Homework: 18,
						Final: 40,
					},
				},
			],
		},
		{
			subjectName: "Computer Programming",
			subjectCode: "CSE103",
			assessments: [
				{
					name: "Midterm",
					weight: "40%",
					date: "2025-01-20",
					pointsPossible: 35,
				},
				{
					name: "Project",
					weight: "30%",
					date: "2025-02-15",
					pointsPossible: 20,
				},
				{
					name: "Final",
					weight: "30%",
					date: "2025-03-25",
					pointsPossible: 45,
				},
			],
			students: [
				{
					studentId: "789",
					firstName: "Charlie",
					lastName: "Brown",
					grades: {
						Midterm: 30,
						Project: 18,
						// Final not graded yet
					},
				},
				{
					studentId: "101",
					firstName: "Diana",
					lastName: "Prince",
					grades: {
						Midterm: 32,
						Project: 16,
						Final: 40,
					},
				},
			],
		},
		{
			subjectName: "History",
			subjectCode: "HIST105",
			assessments: [
				{
					name: "Essay",
					weight: "50%",
					date: "2025-01-25",
					pointsPossible: 30,
				},
				{ name: "Exam", weight: "50%", date: "2025-02-20", pointsPossible: 40 },
			],
			students: [
				{
					studentId: "555",
					firstName: "Eva",
					lastName: "Green",
					grades: {
						Essay: 25,
						Exam: 30,
					},
				},
				{
					studentId: "666",
					firstName: "Frank",
					lastName: "Miller",
					grades: {
						Essay: 27,
						// Exam not graded yet
					},
				},
			],
		},
	],
};

// Helper function to calculate total points earned and total possible points
// Only assessments with a grade are summed.
const calculateTotal = (studentGrades, assessments) => {
	let earned = 0;
	let possible = 0;
	assessments.forEach((assessment) => {
		if (studentGrades[assessment.name] !== undefined) {
			earned += studentGrades[assessment.name];
			possible += assessment.pointsPossible;
		}
	});
	return possible > 0 ? `${earned} / ${possible}` : "-";
};

const Grades = () => {
	const { departmentName, subjects } = mockData;

	// Precompute total points for each student per subject.
	const subjectsWithTotals = useMemo(() => {
		return subjects.map((subject) => {
			const newStudents = subject.students.map((student) => {
				const total = calculateTotal(student.grades, subject.assessments);
				return { ...student, total };
			});
			return { ...subject, students: newStudents };
		});
	}, [subjects]);

	return (
		<div className="grades-container">
			<h1 className="grades-title">Grades for {departmentName}</h1>
			{subjectsWithTotals.map((subject) => (
				<div key={subject.subjectCode} className="grades-subject-block">
					<h2 className="subject-name">
						{subject.subjectName} ({subject.subjectCode})
					</h2>
					<table className="grades-table">
						<thead>
							<tr>
								<th>Student</th>
								{subject.assessments.map((assessment) => (
									<th key={assessment.name}>
										{assessment.name} <br />
										<span className="assessment-weight">
											({assessment.pointsPossible} pts)
										</span>
									</th>
								))}
								<th>Total</th>
							</tr>
						</thead>
						<tbody>
							{subject.students.map((student) => {
								const { studentId, firstName, lastName, grades, total } =
									student;
								return (
									<tr key={studentId}>
										<td>
											{firstName} {lastName}
										</td>
										{subject.assessments.map((assessment) => {
											const gradeValue = grades[assessment.name];
											return (
												<td key={assessment.name}>
													{gradeValue !== undefined ? gradeValue : "/"}
												</td>
											);
										})}
										<td>{total}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			))}
		</div>
	);
};

export default Grades;
