import React, { useState, useEffect } from "react";
import {
	faClock,
	faChalkboardTeacher,
	faListNumeric,
} from "@fortawesome/free-solid-svg-icons";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import TextInput from "../ui/TextInput/TextInput";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";
import AbsentStudentsSelect from "../ui/AbsentStudentsSelect/AbsentStudentsSelect";
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton";
import classLogApi from "../../api/classLogApi";
import studentApi from "../../api/studentApi";
import useAuth from "../../hooks/useAuth";
import "./ClassLogFormModal.css";

const ClassLogFormModal = ({ onClose, departmentId, subjectId }) => {
	const [absentStudents, setAbsentStudents] = useState([]);
	const [classHour, setClassHour] = useState("");
	const [lectureTitle, setLectureTitle] = useState("");
	const [classSequence, setClassSequence] = useState("");
	const [notification, setNotification] = useState("");
	const [studentOptions, setStudentOptions] = useState([]);
	const { user } = useAuth();

	useEffect(() => {
		const fetchStudents = async () => {
			if (!departmentId || !user?.token) {
				setNotification("Error: Missing department ID or user token.");
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
				setNotification("Error fetching students. Please try again.");
			}
		};

		fetchStudents();
	}, [departmentId, user]);

	const handleSubmit = async () => {
		if (!classHour || !lectureTitle || !subjectId) {
			setNotification("Please fill in all required fields.");
			return;
		}

		// Construct the class log data with optional sequence
		const classLogData = {
			departmentId,
			subjectId,
			teacherId: user?.id,
			lectureTitle,
			lectureType: "Lecture", // Assuming this is static
			classDate: new Date().toISOString(),
			period: classHour,
			absentStudentIds: absentStudents.map((s) => s.value),
			...(classSequence && { sequence: parseInt(classSequence, 10) }), // Optional sequence
		};
		console.log("Class log data:", classLogData);
		try {
			await classLogApi.createClassLogWithAbsences(classLogData, user.token);
			setNotification("Class log created successfully!");
			onClose();
		} catch (error) {
			console.error("Error creating class log:", error);
			setNotification("Error creating class log. Please try again.");
		}
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
						onChange={(value) => setClassHour(value)}
						options={[
							{ value: "1", label: "1st Period" },
							{ value: "2", label: "2nd Period" },
							{ value: "3", label: "3rd Period" },
							{ value: "4", label: "4th Period" },
							{ value: "5", label: "5th Period" },
							{ value: "6", label: "6th Period" },
							{ value: "7", label: "7th Period" },
						]}
					/>
					<TextInput
						className="text-input"
						label="Ordinal number"
						icon={faListNumeric}
						placeholder="Optional"
						value={classSequence}
						onChange={(e) => setClassSequence(e.target.value)}
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
