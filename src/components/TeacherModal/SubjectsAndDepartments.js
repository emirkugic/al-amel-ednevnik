import React, { useState, useRef } from "react";
import "./SubjectsAndDepartments.css";

const SubjectsAndDepartments = ({
	subjects,
	availableSubjects,
	departments = [],
	onSubjectsChange,
}) => {
	const [subjectInput, setSubjectInput] = useState({
		subject: null,
		departmentIds: [],
	});
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	const handleSubjectSelect = (subjectId) => {
		setSubjectInput({ ...subjectInput, subject: subjectId });
	};

	const handleDepartmentSelect = (departmentId) => {
		setSubjectInput((prev) => ({
			...prev,
			departmentIds: prev.departmentIds.includes(departmentId)
				? prev.departmentIds.filter((id) => id !== departmentId)
				: [...prev.departmentIds, departmentId],
		}));
	};

	const addSubject = () => {
		if (!subjectInput.subject || subjectInput.departmentIds.length === 0) {
			alert("Please select a subject and at least one department.");
			return;
		}
		const updatedSubjects = [
			...subjects,
			{
				subjectId: subjectInput.subject,
				departmentIds: subjectInput.departmentIds,
			},
		];
		onSubjectsChange(updatedSubjects);
		setSubjectInput({ subject: null, departmentIds: [] });
	};

	const deleteSubject = (index) => {
		const updatedSubjects = subjects.filter((_, i) => i !== index);
		onSubjectsChange(updatedSubjects);
	};

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsDropdownOpen(false);
		}
	};

	// Close dropdown if clicked outside
	React.useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="subjects-and-departments">
			<h4>Subjects and Departments</h4>
			<div className="form-row">
				<select
					value={subjectInput.subject || ""}
					onChange={(e) => handleSubjectSelect(e.target.value)}
					className="subject-select"
				>
					<option value="" disabled>
						Select Subject
					</option>
					{availableSubjects.map((subject) => (
						<option key={subject.id} value={subject.id}>
							{subject.name}
						</option>
					))}
				</select>
				<div className="dropdown-container" ref={dropdownRef}>
					<div className="dropdown-header" onClick={toggleDropdown}>
						{subjectInput.departmentIds.length > 0
							? `Selected (${subjectInput.departmentIds.length})`
							: "Select Departments"}
					</div>
					{isDropdownOpen && (
						<div className="dropdown-menu">
							{departments.map((department) => (
								<label key={department.id} className="dropdown-item">
									<input
										type="checkbox"
										checked={subjectInput.departmentIds.includes(department.id)}
										onChange={() => handleDepartmentSelect(department.id)}
									/>
									{department.departmentName}
								</label>
							))}
						</div>
					)}
				</div>
				<button className="add-subject-button" onClick={addSubject}>
					Add Subject
				</button>
			</div>
			<ul className="subject-list">
				{subjects.map((subject, index) => (
					<li key={index}>
						<span>
							Subject ID: {subject.subjectId}, Departments:{" "}
							{subject.departmentIds.join(", ")}
						</span>
						<button
							onClick={() => deleteSubject(index)}
							className="delete-button"
						>
							Delete
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default SubjectsAndDepartments;
