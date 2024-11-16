import React, { useState } from "react";
import "./ClassManagement.css";

const ClassManagement = () => {
	const [grades, setGrades] = useState(
		Array.from({ length: 12 }, (_, i) => ({
			grade: `${i + 1}`,
			departments: [
				{
					name: `${i + 1}`, // Default department (e.g., "1")
					classTeacher: "No teacher assigned",
				},
			],
		}))
	);

	const addDepartment = (grade) => {
		setGrades((prevGrades) =>
			prevGrades.map((g) =>
				g.grade === grade
					? {
							...g,
							departments: [
								...g.departments,
								{
									name: `${grade}${String.fromCharCode(
										65 + g.departments.length
									)}`, // Add departments like 1A, 1B
									classTeacher: "No teacher assigned",
								},
							],
					  }
					: g
			)
		);
	};

	const assignTeacher = (grade, department) => {
		// Placeholder logic for assigning a teacher
		alert(`Assign teacher for department ${department} in Grade ${grade}`);
	};

	return (
		<div className="class-management">
			<div className="grades-container">
				{grades.map((grade) => (
					<div key={grade.grade} className="grade-section">
						<h3 className="grade-title">{grade.grade} Grade</h3>
						<table className="departments-table">
							<thead>
								<tr>
									<th>Department</th>
									<th>Class Teacher</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{grade.departments.map((dept, index) => (
									<tr key={`${grade.grade}-${index}`}>
										<td>{dept.name}</td>
										<td>{dept.classTeacher}</td>
										<td>
											<button
												className="assign-teacher"
												onClick={() => assignTeacher(grade.grade, dept.name)}
											>
												Assign Teacher
											</button>
										</td>
									</tr>
								))}
								<tr>
									<td colSpan="3">
										<button
											className="add-department"
											onClick={() => addDepartment(grade.grade)}
										>
											Add Department
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				))}
			</div>
		</div>
	);
};

export default ClassManagement;
