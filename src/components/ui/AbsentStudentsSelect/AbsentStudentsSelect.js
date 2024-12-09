import React from "react";
import CreatableSelect from "react-select/creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import "./AbsentStudentsSelect.css";

const AbsentStudentsSelect = ({
	studentOptions,
	absentStudents,
	setAbsentStudents,
	studentInput,
	setStudentInput,
	setNotification,
}) => {
	const addAbsentStudent = (option) => {
		if (
			option &&
			!absentStudents.some((student) => student.value === option.value)
		) {
			setAbsentStudents((prev) => [...prev, option]);
			setStudentInput(null);
			setNotification("");
		} else {
			setNotification(
				"Duplicate entry: You cannot report the same student absent multiple times for the same period."
			);
			setTimeout(() => {
				setNotification("");
			}, 3000);
		}
	};

	const removeAbsentStudent = (index) => {
		setAbsentStudents((prev) => {
			const newAbsentStudents = [...prev];
			newAbsentStudents.splice(index, 1);
			return newAbsentStudents;
		});
	};

	// Filter options to exclude already selected students
	const filteredOptions = studentOptions.filter(
		(option) =>
			!absentStudents.some((student) => student.value === option.value)
	);

	return (
		<div className="form-group">
			<div className="absent-students-header">
				<FontAwesomeIcon icon={faUserPlus} className="header-icon" />
				<span>Absent Students</span>
			</div>
			<CreatableSelect
				isClearable
				isSearchable
				onChange={addAbsentStudent}
				options={filteredOptions}
				value={studentInput}
				placeholder="Type to search students..."
			/>
			<div
				className={`absent-students-list ${
					absentStudents.length > 2 ? "scrollable" : ""
				}`}
			>
				{absentStudents.map((student, index) => (
					<div key={index} className="student-name">
						<span>{student.label}</span>
						<button
							onClick={() => removeAbsentStudent(index)}
							className="remove-student-btn"
						>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default AbsentStudentsSelect;
