import React, { useState } from "react";
import "./ClassManagement.css";

const ClassManagement = () => {
	const [grades, setGrades] = useState(
		Array.from({ length: 12 }, (_, i) => ({
			grade: `${i + 1}`,
			departments: [],
		}))
	);
	const [students, setStudents] = useState([]);

	const addDepartment = (grade) => {
		setGrades((prevGrades) =>
			prevGrades.map((g) =>
				g.grade === grade
					? {
							...g,
							departments: [
								...g.departments,
								`${grade}${String.fromCharCode(65 + g.departments.length)}`, // Add departments like 12A, 12B
							],
					  }
					: g
			)
		);
	};

	return (
		<div className="class-management">
			<div className="header">
				<h2>Class Management</h2>
				<p>Manage your school's grades, class departments, and students</p>
			</div>

			<div className="grades-container">
				{grades.map((g) => (
					<div key={g.grade} className="grade-card">
						<h3>{g.grade} Grade</h3>
						<p>Departments:</p>
						<div className="departments">
							{g.departments.length > 0 ? (
								g.departments.map((dept, index) => (
									<span key={index} className="department">
										{dept}
									</span>
								))
							) : (
								<p className="no-departments">No departments</p>
							)}
						</div>
						<button
							className="add-department"
							onClick={() => addDepartment(g.grade)}
						>
							+ Add Department
						</button>
					</div>
				))}
			</div>

			<div className="students-container">
				<h2>Students</h2>
				<table className="students-table">
					<thead>
						<tr>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Date of Birth</th>
							<th>Parents' Names</th>
							<th>Emails</th>
							<th>Place of Birth</th>
							<th>Country</th>
							<th>Class</th>
						</tr>
					</thead>
					<tbody>
						{students.length > 0 ? (
							students.map((student, index) => (
								<tr key={index}>
									<td>{student.firstName}</td>
									<td>{student.lastName}</td>
									<td>{student.dob}</td>
									<td>{student.parentsNames}</td>
									<td>{student.emails}</td>
									<td>{student.placeOfBirth}</td>
									<td>{student.country}</td>
									<td>{student.class}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="8" className="no-students">
									No students added
								</td>
							</tr>
						)}
					</tbody>
				</table>
				<button className="add-student">+ Add Student</button>
			</div>
		</div>
	);
};

export default ClassManagement;
