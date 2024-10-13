import React, { useState } from "react";
import Select from "react-select";
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
	const [studentInput, setStudentInput] = useState();

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

	const addAbsentStudent = () => {
		if (studentInput.trim()) {
			setAbsentStudents([...absentStudents, studentInput]);
			setStudentInput("");
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
				<Select options={subjects} placeholder="Select subject" />
			</div>

			<div className="form-group">
				<label>
					<FontAwesomeIcon icon={faClock} /> Class Hour
				</label>
				<Select options={classHours} placeholder="Select class hour" />
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
				<div className="add-student">
					<input
						type="text"
						placeholder="Student name"
						value={studentInput}
						onChange={(e) => setStudentInput(e.target.value)}
					/>
					<button onClick={addAbsentStudent}>+</button>
				</div>
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
