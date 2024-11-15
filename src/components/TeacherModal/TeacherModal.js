import React, { useState, useEffect } from "react";
import "./TeacherModal.css";

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

const TeacherModal = ({ teacher, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		name: "",
		surname: "",
		email: "",
		loginPassword: "",
		gradePassword: "",
		subjects: [],
	});

	const [subjectInput, setSubjectInput] = useState({ subject: "", grades: [] });
	const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
	const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

	useEffect(() => {
		if (teacher) {
			setFormData(teacher);
		}
	}, [teacher]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

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
			setFormData({
				...formData,
				subjects: [...formData.subjects, subjectInput],
			});
			setSubjectInput({ subject: "", grades: [] });
		}
	};

	const handleSave = () => {
		onSave(formData);
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<h3>{teacher ? "Edit Teacher" : "Add Teacher"}</h3>
				<form onSubmit={(e) => e.preventDefault()}>
					<div className="form-row">
						<label className="input-label">
							First Name
							<input
								type="text"
								name="name"
								placeholder="First name"
								value={formData.name}
								onChange={handleInputChange}
								required
							/>
						</label>
						<label className="input-label">
							Surname
							<input
								type="text"
								name="surname"
								placeholder="Surname"
								value={formData.surname}
								onChange={handleInputChange}
								required
							/>
						</label>
					</div>
					<div className="form-row">
						<label className="input-label">
							Email
							<input
								type="email"
								name="email"
								placeholder="Email"
								value={formData.email}
								onChange={handleInputChange}
								required
							/>
						</label>
					</div>
					<div className="form-row">
						<label className="input-label">
							Login Password
							<input
								type="password"
								name="loginPassword"
								placeholder="Login password"
								value={formData.loginPassword}
								onChange={handleInputChange}
								required
							/>
						</label>
						<label className="input-label">
							Grade Password
							<input
								type="password"
								name="gradePassword"
								placeholder="Grade password"
								value={formData.gradePassword}
								onChange={handleInputChange}
								required
							/>
						</label>
					</div>

					{/* Subject and Grade Selection */}
					<div className="subject-section">
						<h4>Subjects and Grades</h4>
						<div className="form-row">
							<div className="dropdown">
								<div
									className="dropdown-header"
									onClick={() =>
										setIsSubjectDropdownOpen(!isSubjectDropdownOpen)
									}
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

							<div className="dropdown">
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
							{formData.subjects.map((subject, index) => (
								<div key={index} className="subject-item">
									<span>
										{subject.subject} - Grades: {subject.grades.join(", ")}
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="modal-buttons">
						<button type="button" onClick={handleSave} className="save-button">
							Save
						</button>
						<button type="button" onClick={onClose} className="cancel-button">
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TeacherModal;
