import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBook,
	faClock,
	faChalkboardTeacher,
	faUserPlus,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "./ClassLogForm.css";

const ClassLogForm = () => {
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentInput, setStudentInput] = useState(null);

	const studentOptions = [
		{ value: "John Doe", label: "John Doe" },
		{ value: "Sue Storm", label: "Sue Storm" },
		{ value: "Chris Hemsworth", label: "Chris Hemsworth" },
	];

	const subjects = [
		{ value: "math", label: "Math" },
		{ value: "science", label: "Science" },
		{ value: "history", label: "History" },
	];

	const classHours = [
		{ value: "hour1", label: "1st Hour" },
		{ value: "hour2", label: "2nd Hour" },
		{ value: "hour3", label: "3rd Hour" },
	];

	const addAbsentStudent = (option) => {
		if (option && !absentStudents.includes(option.value)) {
			setAbsentStudents([...absentStudents, option.value]);
			setStudentInput(null);
		}
	};

	const removeAbsentStudent = (index) => {
		const newAbsentStudents = [...absentStudents];
		newAbsentStudents.splice(index, 1);
		setAbsentStudents(newAbsentStudents);
	};

	return (
		<div className="class-log-form">
			<h2>Teacher's Class Log</h2>
			<div className="form-group">
				<label>
					<FontAwesomeIcon icon={faBook} /> Subject
				</label>
				<CreatableSelect options={subjects} placeholder="Select subject" />
			</div>
			<div className="form-group">
				<label>
					<FontAwesomeIcon icon={faClock} /> Class Hour
				</label>
				<CreatableSelect options={classHours} placeholder="Select class hour" />
			</div>
			<div className="form-group">
				<label>
					<FontAwesomeIcon icon={faChalkboardTeacher} /> Lecture Title
				</label>
				<input type="text" placeholder="Enter today's lecture title" />
			</div>
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
					filterOption={(option, inputValue) =>
						option.label
							.toLowerCase()
							.split(" ")
							.some((part) => part.startsWith(inputValue.toLowerCase()))
					}
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
			<div className="class-sequence">
				<label>Class Sequence:</label>
				<span>1</span>
			</div>
			<button className="log-class-btn">Log Class</button>
		</div>
	);
};

export default ClassLogForm;
