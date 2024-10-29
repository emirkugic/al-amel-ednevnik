import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faTimes } from "@fortawesome/free-solid-svg-icons";
import GradesList from "../ui/GradesList/GradesList";
import "./GradesModal.css";

const GradesModal = ({ student, isOpen, onClose }) => {
	const [selectedSemester, setSelectedSemester] = useState("First");

	const semesters = {
		First: [
			{
				subject: "Mathematics",
				teacher: "Dr. Smith",
				details: [
					{ exam: "1st Exam", grade: 90, date: "2024-09-15" },
					{ exam: "2nd Exam", grade: 25, date: "2024-09-20" },
					{ exam: "Oral Exam", grade: 95, date: "2024-09-25" },
					{ exam: "Final Exam", grade: 91, date: "2024-10-10" },
				],
			},
			{
				subject: "Physics",
				teacher: "Mrs. Johnson",
				details: [
					{ exam: "1st Exam", grade: 85, date: "2024-09-18" },
					{ exam: "Oral Exam", grade: 90, date: "2024-10-10" },
					{ exam: "Final Exam", grade: 89, date: "2024-11-20" },
				],
			},
		],
		Second: [
			{
				subject: "Mathematics",
				teacher: "Dr. Smith",
				details: [
					{ exam: "1st Exam", grade: 89, date: "2025-01-15" },
					{ exam: "Oral Exam", grade: 93, date: "2025-02-10" },
					{ exam: "Final Exam", grade: 92, date: "2025-03-12" },
				],
			},
			{
				subject: "Chemistry",
				teacher: "Dr. Brown",
				details: [
					{ exam: "1st Exam", grade: 89, date: "2025-01-20" },
					{ exam: "Oral Exam", grade: 92, date: "2025-02-15" },
					{ exam: "Final Exam", grade: 90, date: "2025-03-20" },
				],
			},
		],
	};

	const handleSemesterChange = (semester) => {
		setSelectedSemester(semester);
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal">
				<div className="modal-header">
					<div className="modal-title">
						<img src={student.imageUrl} alt="student" className="profile-pic" />
						<div>
							<h3>{student.name}'s Grades</h3>
							<p>Student ID: {student.id}</p>
						</div>
					</div>
					<button className="export-btn">
						<FontAwesomeIcon icon={faFileExport} /> Export
					</button>
					<button className="close-btn" onClick={onClose}>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<div className="tab-list-container">
					<div className="tab-list-bg">
						<button
							className={`tab-button ${
								selectedSemester === "First" ? "active" : ""
							}`}
							onClick={() => handleSemesterChange("First")}
						>
							First Semester
						</button>
						<button
							className={`tab-button ${
								selectedSemester === "Second" ? "active" : ""
							}`}
							onClick={() => handleSemesterChange("Second")}
						>
							Second Semester
						</button>
					</div>
				</div>

				{/* Use the GradesList component */}
				<GradesList subjects={semesters[selectedSemester]} />
			</div>
		</div>
	);
};

export default GradesModal;
