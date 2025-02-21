import React, { useState, useEffect } from "react";
import "./DepartmentPage.css";
import Absences from "./components/Absences";
import Grades from "./Grades/Grades";

const DepartmentPage = () => {
	const [tab, setTab] = useState("overview");
	const [departmentData, setDepartmentData] = useState({
		totalClassesHeld: 0,
		totalStudents: 0,
		students: [],
	});

	const { students } = departmentData;

	const renderAbsencesTab = () => (
		<Absences
			students={students}
			onDataChange={(updatedStudents) =>
				setDepartmentData((prev) => ({ ...prev, students: updatedStudents }))
			}
		/>
	);

	const renderGradesTab = () => <Grades />;

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
