import React, { useState, useEffect } from "react";
import {
	faBook,
	faClock,
	faChalkboardTeacher,
	faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import TextInput from "../ui/TextInput/TextInput";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";
import AbsentStudentsSelect from "../ui/AbsentStudentsSelect/AbsentStudentsSelect";
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton";
import studentApi from "../../api/studentApi";
import useAuth from "../../hooks/useAuth";
import "./ClassLogFormModal.css";

const ClassLogFormModal = ({ onClose, departmentId }) => {
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentInput, setStudentInput] = useState(null);
	const [subject, setSubject] = useState("");
	const [classHour, setClassHour] = useState("");
	const [lectureTitle, setLectureTitle] = useState("");
	const [classSequence, setClassSequence] = useState("1");
	const [notification, setNotification] = useState("");
	const [gradeOptions, setGradeOptions] = useState("");
	const [studentOptions, setStudentOptions] = useState([]);
	const { user } = useAuth();

	useEffect(() => {
		const fetchStudents = async () => {
			console.log("Received departmentId:", departmentId); // Debug log
			// console.log("User token:", user?.token); // Debug log
			if (!departmentId || !user?.token) {
				console.error("Department ID or user token is missing");
				return;
			}
			try {
				const students = await studentApi.getStudentsByDepartment(
					departmentId,
					user.token
				);
				setStudentOptions(
					students.map((student) => ({
						value: student.id,
						label: `${student.firstName} ${student.lastName}`,
					}))
				);
			} catch (error) {
				console.error("Error fetching students:", error);
			}
		};

		fetchStudents();
	}, [departmentId, user]);

	const handleSubmit = () => {
		const data = {
			subject,
			classHour,
			lectureTitle,
			absentStudents,
			classSequence,
		};
		console.log("Submitting data:", data);
		onClose();
	};

	return (
		<div className="class-log-form-modal">
			<div className="modal-content">
				<div className="dropdown-row">
					<DropdownSelect
						className="dropdown-select"
						label="Period"
						icon={faClock}
						placeholder="Select"
						value={classHour}
						onChange={(e) => setClassHour(e.value)}
						options={[
							{ value: "1", label: "1st Period" },
							{ value: "2", label: "2nd Period" },
						]}
					/>
					<DropdownSelect
						label="Subject"
						icon={faBook}
						placeholder="Select subject"
						value={subject}
						onChange={(e) => setSubject(e.value)}
						options={[
							{ value: "math", label: "Math" },
							{ value: "science", label: "Science" },
						]}
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

				<div className="button-container">
					<SecondaryButton title="Cancel" onClick={onClose} />
					<PrimaryButton title="Log Class" onClick={handleSubmit} />
				</div>
			</div>
		</div>
	);
};

export default ClassLogFormModal;
