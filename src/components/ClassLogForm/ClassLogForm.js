import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBook,
	faClock,
	faChalkboardTeacher,
	faUserPlus,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "./ClassLogForm.css";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import TextInput from "../ui/TextInput/TextInput";
import CreatableSelect from "react-select/creatable";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";

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
		{ value: "it", label: "Informatika" },
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

	const handleSubmit = () => {
		const data = {
			subject,
			classHour,
			lectureTitle,
			absentStudents,
			classSequence,
		};
		console.log("Submitting data:", data);
		// Placeholder for actual API call
		// fetch("API_ENDPOINT", {
		//  method: "POST",
		//  headers: { "Content-Type": "application/json" },
		//  body: JSON.stringify(data),
		// });
	};

	return (
		<>
			<div className="class-log-form">
				<DropdownSelect
					label="Subject"
					icon={faBook}
					placeholder="Select subject"
					value={subject}
					onChange={(e) => setSubject(e.value)}
					options={subjects}
				/>
				<DropdownSelect
					label="Class Hour"
					icon={faClock}
					placeholder="Select class hour"
					value={classHour}
					onChange={(e) => setClassHour(e.value)}
					options={classHours}
				/>
				<TextInput
					label="Lecture Title"
					icon={faChalkboardTeacher}
					placeholder="Enter today's lecture title"
					value={lectureTitle}
					onChange={(e) => setLectureTitle(e.target.value)}
				/>
				<div className="form-group">
					<label>
						<FontAwesomeIcon icon={faUserPlus} /> Absent Students
					</label>
					{notification && <div className="notification">{notification}</div>}
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
				<PrimaryButton title="Log Class" onClick={handleSubmit} />
			</div>
		</>
	);
};

export default ClassLogForm;
