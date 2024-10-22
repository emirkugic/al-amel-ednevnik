import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChevronDown,
	faChevronUp,
	faArrowUp,
	faArrowDown,
	faFileExport,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./GradesModal.css";

const GradesModal = ({ student, isOpen, onClose }) => {
	const [selectedSemester, setSelectedSemester] = useState("First");
	const [expandedSubject, setExpandedSubject] = useState(null);

	const semesters = {
		First: [
			{
				subject: "Mathematics",
				teacher: "Dr. Smith",
				details: [
					{ exam: "1st Exam", grade: 90 },
					{ exam: "Oral Exam", grade: 95 },
					{ exam: "Final Exam", grade: 91 },
				],
			},
			{
				subject: "Physics",
				teacher: "Mrs. Johnson",
				details: [
					{ exam: "1st Exam", grade: 85 },
					{ exam: "Oral Exam", grade: 90 },
					{ exam: "Final Exam", grade: 89 },
				],
			},
		],
		Second: [
			{
				subject: "Mathematics",
				teacher: "Dr. Smith",
				details: [
					{ exam: "1st Exam", grade: 89 },
					{ exam: "Oral Exam", grade: 93 },
					{ exam: "Final Exam", grade: 92 },
				],
			},
			{
				subject: "Chemistry",
				teacher: "Dr. Brown",
				details: [
					{ exam: "1st Exam", grade: 89 },
					{ exam: "Oral Exam", grade: 92 },
					{ exam: "Final Exam", grade: 90 },
				],
			},
		],
	};

	const handleSemesterChange = (semester) => {
		setSelectedSemester(semester);
		setExpandedSubject(null);
	};

	const toggleSubjectDetails = (subject) => {
		if (expandedSubject === subject) {
			setExpandedSubject(null);
		} else {
			setExpandedSubject(subject);
		}
	};

	const calculateAvgGrade = (details) => {
		const total = details.reduce((acc, curr) => acc + curr.grade, 0);
		return (total / details.length).toFixed(2);
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

				{/* Semester tabs with a shared background */}
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

				{/* Scrollable grades list */}
				<div className="grades-list">
					{semesters[selectedSemester].map((subject, index) => (
						<div key={index} className="subject">
							<div
								className="subject-summary"
								onClick={() => toggleSubjectDetails(subject.subject)}
							>
								<div className="subject-info">
									<h4>{subject.subject}</h4>
									<p>{subject.teacher}</p>
								</div>
								<div className="subject-grade">
									<span>{calculateAvgGrade(subject.details)}%</span>
									<FontAwesomeIcon
										icon={
											expandedSubject === subject.subject
												? faChevronUp
												: faChevronDown
										}
										className="chevron-icon"
									/>
								</div>
							</div>

							{/* Subject details (expandable section with animation) */}
							<div
								className={`subject-details ${
									expandedSubject === subject.subject ? "expanded" : ""
								}`}
								style={{
									maxHeight:
										expandedSubject === subject.subject ? "200px" : "0",
								}}
							>
								{subject.details.map((detail, idx) => (
									<div key={idx} className="exam-detail">
										<p>{detail.exam}</p>
										<p>{detail.grade}%</p>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default GradesModal;
