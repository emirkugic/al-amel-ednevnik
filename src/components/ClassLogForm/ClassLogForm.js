// React and State Management
import React, { useState } from "react";

// Icons
import {
	faBook,
	faClock,
	faChalkboardTeacher,
	faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

// Component Imports
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import TextInput from "../ui/TextInput/TextInput";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";
import AbsentStudentsSelect from "../ui/AbsentStudentsSelect/AbsentStudentsSelect";
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton";

// Styles
import "./ClassLogForm.css";

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
		{ value: "1", label: "1st Period" },
		{ value: "2", label: "2nd Period" },
		{ value: "3", label: "3rd Period" },
		{ value: "4", label: "4th Period" },
		{ value: "5", label: "5th Period" },
		{ value: "6", label: "6th Period" },
		{ value: "7", label: "7th Period" },
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
		// console.log("Submitting data:", data);
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

				<div className="dropdown-row">
					<DropdownSelect
						className="dropdown-select"
						label="Period"
						icon={faClock}
						placeholder="Select"
						value={classHour}
						onChange={(e) => setClassHour(e.value)}
						options={classHours}
					/>
					<DropdownSelect
						className="dropdown-select"
						label="Class"
						icon={faGraduationCap}
						placeholder="Select"
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

				{/* inside a div to center it, doesn't work otherwise...idk 🤷 */}
				<div className="button-container">
					<SecondaryButton title="Cancel" />
					<PrimaryButton title="Log Class" onClick={handleSubmit} />
				</div>
			</div>
		</>
	);
};

export default ClassLogForm;
