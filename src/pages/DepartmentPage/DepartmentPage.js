import React, { useState, useEffect } from "react";
import data from "./data/data.json";
import "./DepartmentPage.css";
import Absences from "./components/Absences";

const DepartmentPage = () => {
	const [tab, setTab] = useState("overview");
	const [departmentData, setDepartmentData] = useState({
		totalClassesHeld: 0,
		totalStudents: 0,
		students: [],
	});

	useEffect(() => {
		setDepartmentData(data);
	}, []);

	const { students } = departmentData;

	const renderAbsencesTab = () => (
		<Absences
			students={students}
			onDataChange={(updatedStudents) =>
				setDepartmentData((prev) => ({ ...prev, students: updatedStudents }))
			}
		/>
	);

	const renderGradesTab = () => (
		<div className="dp-grades-tab">
			<h2>Grades Overview</h2>
			<p>Quick snapshot of each student's average grade.</p>
			<table className="dp-table">
				<thead>
					<tr>
						<th>Student</th>
						<th>Average Grade</th>
						<th>Grade Count</th>
					</tr>
				</thead>
				<tbody>
					{students.map((s) => (
						<tr key={s.id}>
							<td>{s.name}</td>
							<td>{s.avgGrade || 0}</td>
							<td>{s.grades ? s.grades.length : 0}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);

	return (
		<div className="dp-container">
			<h1 className="dp-header">Department Management</h1>

			<div className="dp-tabs-row">
				<button
					className={`dp-tab-btn ${tab === "absences" ? "active" : ""}`}
					onClick={() => setTab("absences")}
				>
					Absences
				</button>
				<button
					className={`dp-tab-btn ${tab === "grades" ? "active" : ""}`}
					onClick={() => setTab("grades")}
				>
					Grades
				</button>
			</div>

			<div className="dp-tab-content">
				{tab === "absences" && renderAbsencesTab()}
				{tab === "grades" && renderGradesTab()}
			</div>
		</div>
	);
};

export default DepartmentPage;
