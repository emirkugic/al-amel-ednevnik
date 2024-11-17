import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import subjectApi from "../../api/subjectApi";
import useAuth from "../../hooks/useAuth"; // Ensure the token is accessed via context
import "./SubjectsAndGrades.css";

const SubjectsAndGrades = ({ subjects, onSubjectsChange }) => {
	const { user } = useAuth(); // Access the token from context
	const [subjectInput, setSubjectInput] = useState({ subject: "", grades: [] });
	const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
	const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
	const [availableSubjects, setAvailableSubjects] = useState([]);

	const subjectDropdownRef = useRef(null);
	const gradeDropdownRef = useRef(null);

	useEffect(() => {
		if (!user || !user.token) return;

		const fetchSubjects = async () => {
			try {
				const fetchedSubjects = await subjectApi.getAllSubjects(user.token);
				setAvailableSubjects(fetchedSubjects);
			} catch (error) {
				console.error("Failed to fetch subjects:", error);
			}
		};

		fetchSubjects();
	}, [user]);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				subjectDropdownRef.current &&
				!subjectDropdownRef.current.contains(event.target)
			) {
				setIsSubjectDropdownOpen(false);
			}
			if (
				gradeDropdownRef.current &&
				!gradeDropdownRef.current.contains(event.target)
			) {
				setIsGradeDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const selectSubject = (subject) => {
		if (subjects.some((s) => s.subjectId === subject.id)) {
			alert("This subject has already been added.");
			return;
		}
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
			const updatedSubjects = [
				...subjects,
				{
					subject: subjectInput.subject.name,
					subjectId: subjectInput.subject.id,
					grades: subjectInput.grades,
				},
			];
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
				<div className="dropdown-container" ref={subjectDropdownRef}>
					<div
						className="dropdown-header"
						onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
					>
						{subjectInput.subject?.name || "Select Subject"}
					</div>
					{isSubjectDropdownOpen && (
						<div className="dropdown-menu">
							{availableSubjects.map((subject) => (
								<div
									key={subject.id}
									className="dropdown-item"
									onClick={() => selectSubject(subject)}
								>
									{subject.name}
								</div>
							))}
						</div>
					)}
				</div>

				<div className="dropdown-container" ref={gradeDropdownRef}>
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
							{[...Array(12).keys()].map((grade) => (
								<label key={grade + 1} className="dropdown-item">
									<input
										type="checkbox"
										checked={subjectInput.grades.includes(
											(grade + 1).toString()
										)}
										onChange={() =>
											toggleGradeSelection((grade + 1).toString())
										}
									/>
									{`${grade + 1}`}
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
			<div className="subject-list-container">
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
		</div>
	);
};

export default SubjectsAndGrades;
