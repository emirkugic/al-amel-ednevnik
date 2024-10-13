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
	const [subject, setSubject] = useState("");
	const [classHour, setClassHour] = useState("");
	const [lectureTitle, setLectureTitle] = useState("");
	const [classSequence, setClassSequence] = useState("1"); // This will be fetched from backend
	const [notification, setNotification] = useState("");

	const studentOptions = [
		{ value: "Emir Kugic", label: "Emir Kugic" },
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
		{ value: "1", label: "1st Hour" },
		{ value: "2", label: "2nd Hour" },
		{ value: "3", label: "3rd Hour" },
		{ value: "4", label: "4th Hour" },
		{ value: "5", label: "5th Hour" },
		{ value: "6", label: "6th Hour" },
		{ value: "7", label: "7th Hour" },
	];

	const addAbsentStudent = (option) => {
		if (option) {
			if (!absentStudents.includes(option.value)) {
				setAbsentStudents([...absentStudents, option.value]);
				setStudentInput(null);
				setNotification(""); // Clear notification if any
			} else {
				setNotification(
					"Duplicate entry: You cannot report the same student absent multiple times for the same period."
				);
				setTimeout(() => {
					setNotification("");
				}, 3000); // Notification will disappear after 3 seconds
			}
		}
	};

	const removeAbsentStudent = (index) => {
		const newAbsentStudents = [...absentStudents];
		newAbsentStudents.splice(index, 1);
		setAbsentStudents(newAbsentStudents);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const data = {
			subject,
			classHour,
			lectureTitle,
			absentStudents,
			classSequence,
		};
		console.log(data);
		// fetch("API_ENDPOINT", {
		// 	method: "POST",
		// 	headers: { "Content-Type": "application/json" },
		// 	body: JSON.stringify(data),
		// });
	};

	return (
		<div className="class-log-form">
			<h2>Teacher's Class Log</h2>
			<div className="form-group">
				<label>
					<FontAwesomeIcon icon={faBook} /> Subject
				</label>
				<CreatableSelect
					options={subjects}
					placeholder="Select subject"
					onChange={(e) => setSubject(e.value)}
				/>
			</div>
			<div className="form-group">
				<label>
					<FontAwesomeIcon icon={faClock} /> Class Hour
				</label>
				<CreatableSelect
					options={classHours}
					placeholder="Select class hour"
					onChange={(e) => setClassHour(e.value)}
				/>
			</div>
			<div className="form-group">
				<label>
					<FontAwesomeIcon icon={faChalkboardTeacher} /> Lecture Title
				</label>
				<input
					type="text"
					placeholder="Enter today's lecture title"
					value={lectureTitle}
					onChange={(e) => setLectureTitle(e.target.value)}
				/>
			</div>
			<div className="form-group">
				{notification && <div className="notification">{notification}</div>}
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
			<div className="class-sequence">
				<label>Class Sequence:</label>
				<span>{classSequence}</span>
			</div>
			<button onClick={handleSubmit} className="log-class-btn">
				Log Class
			</button>
		</div>
	);
};

export default ClassLogForm;
