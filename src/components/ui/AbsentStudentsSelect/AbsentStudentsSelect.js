// React Imports
import React from "react";

// Third-party Components
import CreatableSelect from "react-select/creatable";

// Icon Imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUserPlus } from "@fortawesome/free-solid-svg-icons";

// Style Imports
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
		if (option && !absentStudents.includes(option.value)) {
			setAbsentStudents((prev) => [...prev, option.value]);
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
				options={studentOptions}
				value={studentInput}
				placeholder="Type to search students..."
			/>
			{absentStudents.map((student, index) => (
				<div key={index} className="student-name">
					{student}
					<button
						onClick={() => removeAbsentStudent(index)}
						className="remove-student-btn"
					>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			))}
		</div>
	);
};

export default AbsentStudentsSelect;
