import React, { useState } from "react";
import {
	faBook,
	faClock,
	faChalkboardTeacher,
	faCalendar,
	faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import "./ClassLogForm.css";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import TextInput from "../ui/TextInput/TextInput";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";
import AbsentStudentsSelect from "../ui/AbsentStudentsSelect/AbsentStudentsSelect";

const ClassLogForm = () => {
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentInput, setStudentInput] = useState(null);
	const [subject, setSubject] = useState("");
	const [classHour, setClassHour] = useState("");
	const [lectureTitle, setLectureTitle] = useState("");
	const [classSequence, setClassSequence] = useState("1"); // This will be fetched from backend
	const [notification, setNotification] = useState("");
	const [gradeOptions, setGradeOptions] = useState("");

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

	const classYears = [
		{ value: "1", label: "1st Grade" },
		{ value: "2", label: "2nd Grade" },
		{ value: "3", label: "3rd Grade" },
		{ value: "4", label: "4th Grade" },
		{ value: "5", label: "5th Grade" },
		{ value: "6", label: "6th Grade" },
		{ value: "7", label: "7th Grade" },
		{ value: "8", label: "8th Grade" },
		{ value: "9", label: "9th Grade" },
		{ value: "10", label: "10th Grade" },
		{ value: "11", label: "11th Grade" },
		{ value: "12", label: "12th Grade" },
	];

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
			<h2>Title</h2>
			<div className="class-log-form">
				<DropdownSelect
					label="Subject"
					icon={faBook}
					placeholder="Select subject"
					value={subject}
					onChange={(e) => setSubject(e.value)}
					options={subjects}
				/>

				<div className="dropdown-row">
					<DropdownSelect
						className="dropdown-select"
						label="Class Hour"
						icon={faClock}
						placeholder="Select class hour"
						value={classHour}
						onChange={(e) => setClassHour(e.value)}
						options={classHours}
					/>
					<DropdownSelect
						className="dropdown-select"
						label="Class Year"
						icon={faGraduationCap}
						placeholder="Select class year"
						value={gradeOptions}
						onChange={(e) => setGradeOptions(e.value)}
						options={classYears}
					/>
				</div>

				<TextInput
					label="Lecture Title"
					icon={faChalkboardTeacher}
					placeholder="Enter today's lecture title"
					value={lectureTitle}
					onChange={(e) => setLectureTitle(e.target.value)}
				/>

				{notification && <p className="notification">{notification}</p>}
				<AbsentStudentsSelect
					studentOptions={studentOptions}
					absentStudents={absentStudents}
					setAbsentStudents={setAbsentStudents}
					studentInput={studentInput}
					setStudentInput={setStudentInput}
					setNotification={setNotification}
				/>

				<PrimaryButton title="Log Class" onClick={handleSubmit} />
			</div>
			<h2>bottom</h2>
		</>
	);
};

export default ClassLogForm;
