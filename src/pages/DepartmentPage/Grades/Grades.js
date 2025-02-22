import React, { useMemo, useEffect } from "react";
import "./Grades.css";
import { useAuth, useGrades } from "../../../hooks";

const tempDepartmentId = "673b94896d216a12b56d0c17";

// Calculates total earned points and total possible points only for assessments with a grade.
const calculateTotal = (studentGrades, assessments) => {
	let earned = 0;
	let possible = 0;
	assessments.forEach((assessment) => {
		// Use the assessment's title as the key (for aggregated ones, title is the type)
		if (studentGrades[assessment.title] !== undefined) {
			earned += studentGrades[assessment.title];
			possible += assessment.pointsPossible;
		}
	});
	return possible > 0 ? `${earned} / ${possible}` : "-";
};

const Grades = () => {
	const { user } = useAuth();
	const token = user?.token;
	const { grades, loading, error, fetchGradesByDepartment } = useGrades(token);

	// Fetch grades by department when token is available.
	useEffect(() => {
		if (token) {
			fetchGradesByDepartment(tempDepartmentId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	// Transform the fetched backend data into the structure we need.
	// For assessments with points < 5, we aggregate them by their type.
	const subjects = useMemo(() => {
		if (!grades || !grades.length) return [];
		return grades.map((item) => {
			// Build two sets of display columns:
			// 1. Aggregated columns for assessments under 5 points (grouped by their type).
			// 2. Individual assessments (points >= 5).
			const aggregatedColumns = {}; // key: assessment.type
			const individualAssessments = [];

			// Process each assessment from the backend.
			item.assessments.forEach((assessment) => {
				const points = parseFloat(assessment.points);
				if (points < 5) {
					// Group by type (e.g., "Homework", "Quiz", etc.)
					const type = assessment.type;
					if (!aggregatedColumns[type]) {
						aggregatedColumns[type] = {
							// Use the type as the title for the aggregated column.
							title: type,
							pointsPossible: 0,
						};
					}
					aggregatedColumns[type].pointsPossible += points;
				} else {
					individualAssessments.push({
						title: assessment.title,
						pointsPossible: points,
						assessmentId: assessment.assessmentId,
					});
				}
			});
			// Merge the aggregated and individual assessments.
			const mappedAssessments = [
				...Object.values(aggregatedColumns),
				...individualAssessments,
			];

			// Build student grades.
			// For aggregated assessments, sum the grades per student by type.
			// For individual assessments, record the grade as-is.
			const studentsMap = {};
			item.assessments.forEach((assessment) => {
				const points = parseFloat(assessment.points);
				if (assessment.grades && assessment.grades.length) {
					assessment.grades.forEach((gradeObj) => {
						const student = gradeObj.student;
						const sId = student.id;
						if (!studentsMap[sId]) {
							studentsMap[sId] = {
								studentId: sId,
								firstName: student.firstName,
								lastName: student.lastName,
								grades: {},
							};
						}
						if (points < 5) {
							// Aggregate using the assessment type as key.
							const key = assessment.type;
							if (!studentsMap[sId].grades[key]) {
								studentsMap[sId].grades[key] = 0;
							}
							studentsMap[sId].grades[key] += parseFloat(gradeObj.grade);
						} else {
							// Use the individual assessment title as key.
							const key = assessment.title;
							studentsMap[sId].grades[key] = parseFloat(gradeObj.grade);
						}
					});
				}
			});
			const students = Object.values(studentsMap);
			return {
				subjectName: item.subject.name,
				subjectCode: item.subject.id,
				assessments: mappedAssessments,
				students,
			};
		});
	}, [grades]);

	const departmentName = "Department Grades";

	if (loading) return <div className="grades-container">Loading grades...</div>;
	if (error)
		return (
			<div className="grades-container">
				Error: {error.message || error.toString()}
			</div>
		);
	if (!subjects.length)
		return <div className="grades-container">No grades to display.</div>;

	return (
		<div className="grades-container">
			<h1 className="grades-title">Grades for {departmentName}</h1>
			{subjects.map((subject) => (
				<div key={subject.subjectCode} className="grades-subject-block">
					<h2 className="subject-name">
						{subject.subjectName} ({subject.subjectCode})
					</h2>
					<table className="grades-table">
						<thead>
							<tr>
								<th>Student</th>
								{subject.assessments.map((assessment) => (
									<th key={assessment.assessmentId || assessment.title}>
										{assessment.title} <br />
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
								const {
									studentId,
									firstName,
									lastName,
									grades: studentGrades,
								} = student;
								const total = calculateTotal(
									studentGrades,
									subject.assessments
								);
								return (
									<tr key={studentId}>
										<td>
											{firstName} {lastName}
										</td>
										{subject.assessments.map((assessment) => {
											// For aggregated columns, the key is the type;
											// for individual assessments, the key is the title.
											const key = assessment.title;
											const gradeValue = studentGrades[key];
											return (
												<td key={assessment.assessmentId || assessment.title}>
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
