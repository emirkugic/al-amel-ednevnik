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
		if (option) {
			if (!absentStudents.includes(option.value)) {
				setAbsentStudents([...absentStudents, option.value]);
				setStudentInput(null); // Clear input after adding
				setNotification(""); // Clear any existing notifications
			} else {
				setNotification(
					"Duplicate entry: You cannot report the same student absent multiple times for the same period."
				);
				setTimeout(() => {
					setNotification("");
				}, 3000);
			}
		}
	};

	const removeAbsentStudent = (index) => {
		const newAbsentStudents = [...absentStudents];
		newAbsentStudents.splice(index, 1);
		setAbsentStudents(newAbsentStudents);
	};

	return (
		<div className="form-group">
			<label>
				<FontAwesomeIcon icon={faUserPlus} /> Absent Students
			</label>
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
