import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./SubjectsAndGrades.css";

const grades = [
	"1st",
	"2nd",
	"3rd",
	"4th",
	"5th",
	"6th",
	"7th",
	"8th",
	"9th",
	"10th",
	"11th",
	"12th",
];

const subjectsList = [
	"Math",
	"Physics",
	"Chemistry",
	"Biology",
	"History",
	"Geography",
	"English",
	"Computer Science",
];

const SubjectsAndGrades = ({ subjects, onSubjectsChange }) => {
	const [subjectInput, setSubjectInput] = useState({ subject: "", grades: [] });
	const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
	const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

	const selectSubject = (subject) => {
		setSubjectInput({ ...subjectInput, subject });
		setIsSubjectDropdownOpen(false);
	};

	const toggleGradeSelection = (grade) => {
		setSubjectInput((prev) => ({
			...prev,
			grades: prev.grades.includes(grade)
				? prev.grades.filter((g) => g !== grade)
				: [...prev.grades, grade],
		}));
	};

	const addSubject = () => {
		if (subjectInput.subject && subjectInput.grades.length > 0) {
			const updatedSubjects = [...subjects, subjectInput];
			onSubjectsChange(updatedSubjects);
			setSubjectInput({ subject: "", grades: [] });
			setIsGradeDropdownOpen(false);
		}
	};

	const deleteSubject = (index) => {
		const updatedSubjects = subjects.filter((_, i) => i !== index);
		onSubjectsChange(updatedSubjects);
	};

	return (
		<div className="subject-section">
			<h4>Subjects and Grades</h4>
			<div className="form-row">
				<div className="dropdown-container">
					<div
						className="dropdown-header"
						onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
					>
						{subjectInput.subject || "Select Subject"}
					</div>
					{isSubjectDropdownOpen && (
						<div className="dropdown-menu">
							{subjectsList.map((subject) => (
								<div
									key={subject}
									className="dropdown-item"
									onClick={() => selectSubject(subject)}
								>
									{subject}
								</div>
							))}
						</div>
					)}
				</div>

				<div className="dropdown-container">
					<div
						className="dropdown-header"
						onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
					>
						{subjectInput.grades.length > 0
							? subjectInput.grades.join(", ")
							: "Select Grades"}
					</div>
					{isGradeDropdownOpen && (
						<div className="dropdown-menu">
							{grades.map((grade) => (
								<label key={grade} className="dropdown-item">
									<input
										type="checkbox"
										checked={subjectInput.grades.includes(grade)}
										onChange={() => toggleGradeSelection(grade)}
									/>
									{grade}
								</label>
							))}
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={addSubject}
					className="add-subject-button"
				>
					Add Subject
				</button>
			</div>
			<div className="subject-list">
				{subjects.map((subject, index) => (
					<div key={index} className="subject-item">
						<span>
							{subject.subject} - Grades: {subject.grades.join(", ")}
						</span>
						<button
							onClick={() => deleteSubject(index)}
							className="delete-button"
						>
							<FontAwesomeIcon icon={faTrash} className="trash-icon" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default SubjectsAndGrades;
