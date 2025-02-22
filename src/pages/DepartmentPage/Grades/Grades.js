import React, { useMemo, useEffect } from "react";
import "./Grades.css";
import { useAuth, useGrades, useClassTeacher } from "../../../hooks";

const tempDepartmentId = "673b94896d216a12b56d0c17";

const calculateTotal = (studentGrades, assessments) => {
	let earned = 0;
	let possible = 0;
	assessments.forEach((assessment) => {
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

	const classTeacherDeptId = useClassTeacher();
	const departmentId = classTeacherDeptId || tempDepartmentId;

	const { grades, loading, error, fetchGradesByDepartment } = useGrades(token);

	useEffect(() => {
		if (token) {
			fetchGradesByDepartment(departmentId);
		}
	}, [token, departmentId]);

	const subjects = useMemo(() => {
		if (!grades || !grades.length) return [];
		return grades
			.map((item) => {
				const aggregatedColumns = {};
				const individualAssessments = [];

				item.assessments.forEach((assessment) => {
					if (!assessment.grades || assessment.grades.length === 0) return;
					const points = parseFloat(assessment.points);
					if (points < 5) {
						const type = assessment.type;
						if (!aggregatedColumns[type]) {
							aggregatedColumns[type] = {
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

				const mappedAssessments = [
					...Object.values(aggregatedColumns),
					...individualAssessments,
				];

				if (mappedAssessments.length === 0) return null;

				const studentsMap = {};
				item.assessments.forEach((assessment) => {
					if (!assessment.grades || assessment.grades.length === 0) return;
					const points = parseFloat(assessment.points);
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
							const key = assessment.type;
							if (!studentsMap[sId].grades[key]) {
								studentsMap[sId].grades[key] = 0;
							}
							studentsMap[sId].grades[key] += parseFloat(gradeObj.grade);
						} else {
							const key = assessment.title;
							studentsMap[sId].grades[key] = parseFloat(gradeObj.grade);
						}
					});
				});
				const students = Object.values(studentsMap);
				return {
					subjectName: item.subject.name,
					subjectCode: item.subject.id,
					assessments: mappedAssessments,
					students,
				};
			})
			.filter((subject) => subject !== null);
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
					<h2 className="subject-name">{subject.subjectName}</h2>
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
