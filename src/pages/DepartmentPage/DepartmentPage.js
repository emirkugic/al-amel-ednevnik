import React, { useState, useEffect } from "react";
import "./DepartmentPage.css";
import Absences from "./components/Absences";
import Grades from "./Grades/Grades";

const DepartmentPage = () => {
	const [tab, setTab] = useState("grades");
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
		<div className="grade-sys-container">
			<div className="grade-sys-tabs">
				<button
					className={`grade-sys-tab ${
						tab === "grades" ? "grade-sys-active" : ""
					}`}
					onClick={() => setTab("grades")}
				>
					Grades
				</button>
				<button
					className={`grade-sys-tab ${
						tab === "absences" ? "grade-sys-active" : ""
					}`}
					onClick={() => setTab("absences")}
				>
					Absences
				</button>
			</div>

			<div className="grade-sys-content">
				{tab === "absences" && renderAbsencesTab()}
				{tab === "grades" && renderGradesTab()}
			</div>
		</div>
	);
};

export default DepartmentPage;
