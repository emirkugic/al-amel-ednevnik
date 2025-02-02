import React, { useState, useEffect, useContext } from "react";
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
import { ClassLogsContext } from "../../contexts/ClassLogsContext";
import "./ClassLogFormModal.css";

const getWorkWeekDates = () => {
	const today = new Date();
	const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	const monday = new Date(today);
	monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1)); // Adjust to Monday
	const dates = [];

	for (let i = 0; i < 5; i++) {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);

		// Only add days up to today
		if (date <= today) {
			dates.push({
				value: date.toISOString().split("T")[0], // YYYY-MM-DD format
				label: date.toLocaleDateString("en-US", { weekday: "long" }),
			});
		}
	}

	return dates;
};

const ClassLogFormModal = ({ onClose, departmentId, subjectId }) => {
	const weekDays = getWorkWeekDates();
	const [selectedDay, setSelectedDay] = useState(
		weekDays.find((day) => day.value === new Date().toISOString().split("T")[0])
			?.value || null
	);
	const [classHour, setClassHour] = useState("");
	const [lectureTitle, setLectureTitle] = useState("");
	const [classSequence, setClassSequence] = useState("");
	const [notification, setNotification] = useState("");
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentOptions, setStudentOptions] = useState([]);
	const { user } = useAuth();
	const { setClassLogs } = useContext(ClassLogsContext);
	const [isLoading, setIsLoading] = useState(false);

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
		if (!selectedDay || !classHour || !lectureTitle || !subjectId) {
			setNotification("Please fill in all required fields.");
			return;
		}

		const utcDate = new Date(selectedDay);
		utcDate.setUTCHours(0, 0, 0, 0);

		const classLogData = {
			departmentId,
			subjectId,
			teacherId: user?.id,
			lectureTitle,
			lectureType: "Lecture",
			classDate: utcDate.toISOString(),
			period: classHour,
			absentStudentIds: absentStudents.map((s) => s.value),
			...(classSequence && { sequence: parseInt(classSequence, 10) }),
		};

		setIsLoading(true);
		try {
			const newClassLog = await classLogApi.createClassLogWithAbsences(
				classLogData,
				user.token
			);

			setClassLogs((prevLogs) =>
				prevLogs.map((log) =>
					log.departmentId === departmentId
						? {
								...log,
								subjects: log.subjects.map((subject) =>
									subject.subjectId === subjectId
										? {
												...subject,
												classLogs: [
													...subject.classLogs,
													{
														...newClassLog,
														classLogId: newClassLog.id,
														subjectName: subject.name,
														absentStudents: absentStudents.map((s) => ({
															studentId: s.value,
															name: s.label,
														})),
													},
												],
										  }
										: subject
								),
						  }
						: log
				)
			);

			setNotification("Class log created successfully!");
			onClose();
		} catch (error) {
			console.error("Error creating class log:", error);
			// Check if the error is a conflict (HTTP 409)
			if (error.response && error.response.status === 409) {
				setNotification(`English:
								This day and period has already been logged. Cannot have duplicates.

								Bosnian:
								Ovaj dan i čas su već zabilježeni. Ne može biti duplikata.`);
			} else {
				setNotification(`Error creating class log. Please try again.`);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="class-log-form-modal">
			<div className="modal-content">
				{isLoading && <div className="loading-bar"></div>}

				<DropdownSelect
					className="dropdown-select"
					label="Day of the Week"
					placeholder="Select a day"
					value={selectedDay}
					onChange={(value) => setSelectedDay(value)}
					options={weekDays}
				/>

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
					setNotification={setNotification}
				/>

				<div className="button-container">
					<SecondaryButton
						title="Cancel"
						onClick={onClose}
						disabled={isLoading}
					/>
					<PrimaryButton
						title="Log Class"
						onClick={handleSubmit}
						disabled={isLoading}
					/>
				</div>
			</div>
		</div>
	);
};

export default ClassLogFormModal;
