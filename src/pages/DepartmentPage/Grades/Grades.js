import React, { useEffect, useMemo, useState } from "react";
import "./Grades.css";
import { useAuth, useGrades, useClassTeacher } from "../../../hooks";

const tempDepartmentId = "673b94896d216a12b56d0c17";

/* Helpers to calculate totals and averages */
const calculateStudentTotal = (studentGrades, assessments) => {
	let earned = 0;
	let possible = 0;
	assessments.forEach((assess) => {
		const val = studentGrades[assess.title];
		if (val !== undefined) {
			earned += val;
			possible += assess.pointsPossible;
		}
	});
	return { earned, possible };
};

const calculateSubjectAverage = (students, assessments) => {
	let sumEarned = 0;
	let sumPossible = 0;
	students.forEach((stu) => {
		const { earned, possible } = calculateStudentTotal(stu.grades, assessments);
		sumEarned += earned;
		sumPossible += possible;
	});
	if (sumPossible === 0) return "-";
	const avg = (sumEarned / sumPossible) * 100;
	return avg.toFixed(1) + "%";
};

const Grades = () => {
	const { user } = useAuth();
	const token = user?.token;

	// If teacher is class teacher, use that dept; otherwise fallback.
	const classTeacherDeptId = useClassTeacher();
	const departmentId = classTeacherDeptId || tempDepartmentId;

	// Hook to fetch grades
	const { grades, loading, error, fetchGradesByDepartment } = useGrades(token);

	// Active tab index
	const [activeTabIndex, setActiveTabIndex] = useState(0);

	useEffect(() => {
		if (token) {
			fetchGradesByDepartment(departmentId);
		}
	}, [token, departmentId]);

	// Transform backend data
	const subjects = useMemo(() => {
		if (!grades || !grades.length) return [];

		return grades
			.map((item) => {
				// Collect <5 point assessments by type
				const aggregated = {};
				const individual = [];

				item.assessments.forEach((assess) => {
					if (!assess.grades || assess.grades.length === 0) return;
					const pts = parseFloat(assess.points);
					if (pts < 5) {
						const key = assess.type;
						if (!aggregated[key]) {
							aggregated[key] = {
								title: key,
								pointsPossible: 0,
							};
						}
						aggregated[key].pointsPossible += pts;
					} else {
						individual.push({
							title: assess.title,
							pointsPossible: pts,
							assessmentId: assess.assessmentId,
						});
					}
				});

				const combinedAssessments = [
					...Object.values(aggregated),
					...individual,
				];
				if (combinedAssessments.length === 0) return null;

				// Build student map
				const stuMap = {};
				item.assessments.forEach((assess) => {
					if (!assess.grades || assess.grades.length === 0) return;
					const pts = parseFloat(assess.points);
					assess.grades.forEach((g) => {
						const s = g.student;
						if (!stuMap[s.id]) {
							stuMap[s.id] = {
								studentId: s.id,
								firstName: s.firstName,
								lastName: s.lastName,
								grades: {},
							};
						}
						if (pts < 5) {
							// aggregate by type
							const typeKey = assess.type;
							if (!stuMap[s.id].grades[typeKey]) {
								stuMap[s.id].grades[typeKey] = 0;
							}
							stuMap[s.id].grades[typeKey] += parseFloat(g.grade);
						} else {
							const key = assess.title;
							stuMap[s.id].grades[key] = parseFloat(g.grade);
						}
					});
				});
				const students = Object.values(stuMap);

				return {
					subjectName: item.subject.name,
					subjectCode: item.subject.id,
					assessments: combinedAssessments,
					students,
				};
			})
			.filter(Boolean);
	}, [grades]);

	if (loading) return <div className="grades-page">Loading grades...</div>;
	if (error)
		return (
			<div className="grades-page">
				Error: {error.message || error.toString()}
			</div>
		);
	if (!subjects.length)
		return <div className="grades-page">No grades to display.</div>;

	// Current tab subject
	const currentSubject = subjects[activeTabIndex];
	const departmentTitle = "Department Grades"; // or actual department name

	return (
		<div className="grades-page">
			<h1 className="grades-title">Grades for {departmentTitle}</h1>

			{/* Tab bar */}
			<div className="subject-tabs">
				{subjects.map((sub, idx) => (
					<button
						key={sub.subjectCode}
						className={`subject-tab ${idx === activeTabIndex ? "active" : ""}`}
						onClick={() => setActiveTabIndex(idx)}
					>
						{sub.subjectName}
					</button>
				))}
			</div>

			{/* Subject Info and Table */}
			<div className="subject-panel">
				<div className="subject-info">
					<h2>{currentSubject.subjectName}</h2>
					<p>
						<strong>{currentSubject.students.length}</strong> Students
					</p>
					<p>
						<strong>{currentSubject.assessments.length}</strong> Assessments
					</p>
					<p>
						Overall Avg:{" "}
						<strong>
							{calculateSubjectAverage(
								currentSubject.students,
								currentSubject.assessments
							)}
						</strong>
					</p>
				</div>
				<div className="grades-table-container">
					<table className="grades-table">
						<thead>
							<tr>
								<th>Student</th>
								{currentSubject.assessments.map((assess) => (
									<th key={assess.assessmentId || assess.title}>
										<div className="table-head-title">{assess.title}</div>
										<div className="table-head-points">
											({assess.pointsPossible} pts)
										</div>
									</th>
								))}
								<th>Total</th>
							</tr>
						</thead>
						<tbody>
							{currentSubject.students.map((stu) => {
								const { earned, possible } = calculateStudentTotal(
									stu.grades,
									currentSubject.assessments
								);
								const totalLabel =
									possible > 0 ? `${earned} / ${possible}` : "-";
								return (
									<tr key={stu.studentId}>
										<td className="student-cell">
											{stu.firstName} {stu.lastName}
										</td>
										{currentSubject.assessments.map((assess) => {
											const key = assess.title;
											const gradeVal = stu.grades[key];
											return (
												<td key={assess.assessmentId || key}>
													{gradeVal ?? "/"}
												</td>
											);
										})}
										<td className="total-col">{totalLabel}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default Grades;
