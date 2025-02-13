import React, { useState, useEffect, useContext } from "react";
import {
	faClock,
	faChalkboardTeacher,
	faCalendar,
	faBook,
} from "@fortawesome/free-solid-svg-icons";

import {
	PrimaryButton,
	SecondaryButton,
	TextInput,
	DropdownSelect,
	AbsentStudentsSelect,
} from "../ui";

import { studentApi } from "../../api/";

import {
	getWorkWeekDates,
	toMidnightUTC,
	validateClassLog,
	createNewClassLog,
} from "../../utils";

import useAuth from "../../hooks/useAuth";
import { ClassLogsContext } from "../../contexts/ClassLogsContext";

import "./ClassLogFormModal.css";

const ClassLogFormModal = ({
	onClose,
	departmentId,
	subjectId,
	disableDayAndPeriodSelection = false,
	externalDate,
	externalPeriod,
	subjects = [],
	onSuccess,
}) => {
	const weekDays = getWorkWeekDates();

	// Old UI states
	const [selectedDay, setSelectedDay] = useState(
		weekDays.find((day) => day.value === new Date().toISOString().split("T")[0])
			?.value || ""
	);
	const [classHour, setClassHour] = useState("");

	// Shared
	const [lectureTitle, setLectureTitle] = useState("");
	const [classSequence, setClassSequence] = useState("");
	const [notification, setNotification] = useState("");
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentOptions, setStudentOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	// Auth + context
	const { user, assignedSubjects } = useAuth();
	const { setClassLogs } = useContext(ClassLogsContext);

	// New UI states (for the scenario where day/period come from outside)
	const [teacherSubjects, setTeacherSubjects] = useState([]);
	const [selectedSubject, setSelectedSubject] = useState(subjectId || "");

	const isNewUiMode = disableDayAndPeriodSelection;

	useEffect(() => {
		// Early exit if we lack required info
		if (!departmentId || !user?.token) {
			setNotification("Error: Missing department ID or user token.");
			return;
		}

		const fetchStudents = async () => {
			try {
				const students = await studentApi.getStudentsByDepartment(
					departmentId,
					user.token
				);
				setStudentOptions(
					students.map((s) => ({
						value: s.id,
						label: `${s.firstName} ${s.lastName}`,
					}))
				);
			} catch (error) {
				setNotification("Error fetching students. Please try again.");
			}
		};
		fetchStudents();
	}, [departmentId, user]);

	useEffect(() => {
		// If using new UI, gather teacher's assigned subjects for the selected department
		if (!isNewUiMode || !assignedSubjects || assignedSubjects.length === 0) {
			return;
		}

		// Filter assigned subjects by department
		const subsInDept = assignedSubjects.filter((as) =>
			as.departmentId.includes(departmentId)
		);

		// Convert to { value, label }
		const teacherSubs = subsInDept.map((as) => {
			const foundSub = subjects.find((s) => s.id === as.subjectId);
			return {
				value: as.subjectId,
				label: foundSub ? foundSub.name : as.subjectId,
			};
		});
		setTeacherSubjects(teacherSubs);

		if (!selectedSubject && teacherSubs.length > 0) {
			setSelectedSubject(teacherSubs[0].value);
		}
	}, [isNewUiMode, assignedSubjects, departmentId, subjects, selectedSubject]);

	const handleSubmit = async () => {
		let finalDate = selectedDay;
		let finalPeriod = classHour;
		let finalSubjectId = subjectId;

		if (isNewUiMode) {
			if (!externalDate || !externalPeriod) {
				setNotification(
					"Error: 'disableDayAndPeriodSelection' is active, but no external date/period provided."
				);
				return;
			}
			finalDate = externalDate;
			finalPeriod = externalPeriod;

			if (teacherSubjects.length > 0) {
				finalSubjectId = selectedSubject;
			}
		}

		// Validate inputs
		const error = validateClassLog({
			lectureTitle,
			date: finalDate,
			period: finalPeriod,
			subjectId: finalSubjectId,
			absentStudents,
		});
		if (error) {
			setNotification(error);
			return;
		}

		// Prepare final payload
		const utcDate = toMidnightUTC(finalDate);
		const classLogData = {
			departmentId,
			subjectId: finalSubjectId,
			teacherId: user?.id,
			lectureTitle,
			lectureType: "Lecture",
			classDate: utcDate,
			period: finalPeriod,
			absentStudentIds: absentStudents.map((s) => s.value),
			...(classSequence && { sequence: parseInt(classSequence, 10) }),
		};

		setIsLoading(true);
		try {
			const newClassLog = await createNewClassLog({
				classLogData,
				userToken: user.token,
				setClassLogs,
				departmentId,
				subjectId: finalSubjectId,
				absentStudents,
			});

			// Trigger parent callback
			if (onSuccess) {
				onSuccess({
					id: newClassLog.id,
					teacherId: newClassLog.teacherId,
					departmentId: departmentId,
					subjectId: newClassLog.subjectId,
					lectureTitle: newClassLog.lectureTitle,
					classDate: newClassLog.classDate,
					period: newClassLog.period,
					sequence: newClassLog.sequence,
				});
			}

			setNotification("Class log created successfully!");
			onClose();
		} catch (error) {
			console.error("Error creating class log:", error);
			if (error.response && error.response.status === 409) {
				setNotification(`English:
  This day and period have already been logged. Cannot have duplicates.

Bosnian:
  Ovaj dan i čas su već zabilježeni. Ne može biti duplikata.`);
			} else {
				setNotification("Error creating class log. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={`class-log-form-modal ${isNewUiMode ? "new-ui-mode" : ""}`}>
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-content">
				{isLoading && <div className="loading-bar"></div>}

				<h2 className="modal-title">Log a Class</h2>

				{!isNewUiMode && (
					<>
						<DropdownSelect
							className="dropdown-select"
							label="Day of the Week"
							placeholder="Select a day"
							icon={faCalendar}
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
						</div>
					</>
				)}

				{isNewUiMode && (
					<DropdownSelect
						className="dropdown-select"
						label="Subject"
						icon={faBook}
						placeholder="Select a subject"
						value={selectedSubject}
						onChange={(val) => setSelectedSubject(val)}
						options={teacherSubjects}
					/>
				)}

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
