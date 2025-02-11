import React, { useState, useEffect } from "react";
import data from "./data/data.json";
import "./DepartmentPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faClipboardList,
	faUserGraduate,
	faTimes,
	faChartLine,
	faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Absences from "./components/Absences";

const DepartmentPage = () => {
	const [tab, setTab] = useState("overview");
	const [departmentData, setDepartmentData] = useState({
		totalClassesHeld: 0,
		totalStudents: 0,
		students: [],
	});

	useEffect(() => {
		// In real usage, fetch from API
		setDepartmentData(data);
	}, []);

	const { totalClassesHeld, totalStudents, students } = departmentData;

	// Basic derived stats
	const totalAbsences = students.reduce((acc, s) => acc + s.absences, 0);
	const avgGradeAll = (
		students.reduce((acc, s) => acc + (s.avgGrade || 0), 0) /
		(students.length || 1)
	).toFixed(1);

	// ----- TAB CONTENT -----
	const renderOverviewTab = () => {
		return (
			<div className="dp-overview-tab">
				<h2>Class Overview</h2>
				<div className="dp-stats-grid">
					<div className="dp-stat-item">
						<FontAwesomeIcon icon={faClipboardList} className="dp-stat-icon" />
						<h3>{totalClassesHeld}</h3>
						<p>Total Classes</p>
					</div>
					<div className="dp-stat-item">
						<FontAwesomeIcon icon={faUserGraduate} className="dp-stat-icon" />
						<h3>{totalStudents || students.length}</h3>
						<p>Students</p>
					</div>
					<div className="dp-stat-item">
						<FontAwesomeIcon icon={faTimes} className="dp-stat-icon red" />
						<h3>{totalAbsences}</h3>
						<p>Total Absences</p>
					</div>
					<div className="dp-stat-item">
						<FontAwesomeIcon icon={faChartLine} className="dp-stat-icon" />
						<h3>{avgGradeAll}</h3>
						<p>Avg Class Grade</p>
					</div>
				</div>
			</div>
		);
	};

	const renderStudentsTab = () => (
		<div className="dp-students-tab">
			<h2>Student Roster</h2>
			<p className="tab-description">
				Here is a read-only list of students. Only administrators can add or
				remove students.
			</p>
			<table className="dp-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Absences</th>
						<th>Present</th>
						<th>Avg Grade</th>
					</tr>
				</thead>
				<tbody>
					{students.map((s) => (
						<tr key={s.id}>
							<td>{s.name}</td>
							<td>{s.absences}</td>
							<td>{s.present}</td>
							<td>{s.avgGrade || 0}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);

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

	const renderAnalyticsTab = () => (
		<div className="dp-analytics-tab">
			<h2>Analytics & Insights</h2>
			<p>
				Here we can add advanced charts, stats, or AI-driven insights later.
			</p>
			<div className="dp-fake-charts-wrap">
				<div className="dp-fake-chart-card">
					<h4>Attendance Over Time</h4>
					<div className="dp-fake-chart">[Line Chart Placeholder]</div>
				</div>
				<div className="dp-fake-chart-card">
					<h4>Grade Distribution</h4>
					<div className="dp-fake-chart">[Bar Chart Placeholder]</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="dp-container">
			<h1 className="dp-header">Department Management</h1>

			<div className="dp-tabs-row">
				<button
					className={`dp-tab-btn ${tab === "overview" ? "active" : ""}`}
					onClick={() => setTab("overview")}
				>
					Overview
				</button>
				<button
					className={`dp-tab-btn ${tab === "students" ? "active" : ""}`}
					onClick={() => setTab("students")}
				>
					Students
				</button>
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
				<button
					className={`dp-tab-btn ${tab === "analytics" ? "active" : ""}`}
					onClick={() => setTab("analytics")}
				>
					Analytics
				</button>
			</div>

			<div className="dp-tab-content">
				{tab === "overview" && renderOverviewTab()}
				{tab === "students" && renderStudentsTab()}
				{tab === "absences" && renderAbsencesTab()}
				{tab === "grades" && renderGradesTab()}
				{tab === "analytics" && renderAnalyticsTab()}
			</div>
		</div>
	);
};

export default DepartmentPage;
