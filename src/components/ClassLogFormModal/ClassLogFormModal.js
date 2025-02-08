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

/** Original function that builds Monday->today date list. */
const getWorkWeekDates = () => {
	const today = new Date();
	const currentDay = today.getDay(); // 0=Sun,1=Mon,...,6=Sat
	const monday = new Date(today);
	monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1)); // Adjust to Monday
	const dates = [];

	for (let i = 0; i < 5; i++) {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);

		// Only add days up to "today"
		if (date <= today) {
			dates.push({
				value: date.toISOString().split("T")[0], // "YYYY-MM-DD"
				label: date.toLocaleDateString("en-US", { weekday: "long" }),
			});
		}
	}
	return dates;
};

/**
 * ClassLogFormModal
 *
 * - If `disableDayAndPeriodSelection` = false (default), we show the old UI (Day + Period).
 * - If `disableDayAndPeriodSelection` = true, we hide day/period inputs and rely on
 *   `externalDate` + `externalPeriod` from the parent. We can also show a subject dropdown
 *   if you like (for teacher to pick from assigned subjects).
 */
const ClassLogFormModal = ({
	onClose,
	departmentId,
	subjectId, // existing prop
	disableDayAndPeriodSelection = false, // NEW optional flag
	externalDate, // used if we disable the day/period
	externalPeriod, // used if we disable the day/period
}) => {
	const weekDays = getWorkWeekDates();

	// ---------- OLD UI States (unchanged) ----------
	const [selectedDay, setSelectedDay] = useState(
		weekDays.find((day) => day.value === new Date().toISOString().split("T")[0])
			?.value || null
	);
	const [classHour, setClassHour] = useState("");

	// ---------- SHARED FIELDS ----------
	const [lectureTitle, setLectureTitle] = useState("");
	const [classSequence, setClassSequence] = useState("");
	const [notification, setNotification] = useState("");
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentOptions, setStudentOptions] = useState([]);
	const { user } = useAuth();
	const { setClassLogs } = useContext(ClassLogsContext);
	const [isLoading, setIsLoading] = useState(false);

	// ---------- NEW: Possibly let teacher pick subject if day/period is locked externally. ----------
	// Example usage if you want a subject dropdown. If not needed, you can skip this or just hide it.
	const [teacherSubjects, setTeacherSubjects] = useState([]); // e.g. assigned subjects
	const [selectedSubject, setSelectedSubject] = useState(subjectId || "");

	// Decide if we are in "old UI" or "new UI" mode
	// (If disableDayAndPeriodSelection === true => new UI)
	const isNewUiMode = disableDayAndPeriodSelection;

	useEffect(() => {
		// Fetch students for the entire department
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

	useEffect(() => {
		// Example: If in new UI mode, maybe fetch the teacher's subjects
		// Then user can pick which subject to log for that date/period.
		if (!isNewUiMode || !user?.token) return;
		// Placeholder for assigned subjects logic:
		// In real usage, you'd fetch from your teacher's assigned subjects.
		const placeholderSubs = [
			{ value: "6738ef75fc4963c76fefc3dc", label: "Informatika" },
			{ value: "eng202", label: "English 202" },
		];
		setTeacherSubjects(placeholderSubs);

		// If we don't have a selected subject yet, pick the first
		if (!selectedSubject && placeholderSubs.length > 0) {
			setSelectedSubject(placeholderSubs[0].value);
		}
	}, [isNewUiMode, user, selectedSubject]);

	// ---------- SUBMIT ----------
	const handleSubmit = async () => {
		// 1) Validate required fields
		if (!lectureTitle) {
			setNotification("Please fill in all required fields (lecture title).");
			return;
		}

		// In old UI => we have selectedDay + classHour
		// In new UI => we rely on externalDate + externalPeriod
		let finalDate = selectedDay;
		let finalPeriod = classHour;
		let finalSubjectId = subjectId;

		if (isNewUiMode) {
			if (!externalDate || !externalPeriod) {
				setNotification(
					"Error: 'disableDayAndPeriodSelection' is active, but no external date/period was provided."
				);
				return;
			}
			finalDate = externalDate;
			finalPeriod = externalPeriod;

			// If you want subject selection in new UI, override subjectId
			if (teacherSubjects.length > 0) {
				finalSubjectId = selectedSubject;
			}
		}

		// Check we have day/period/subject
		if (!finalDate || !finalPeriod || !finalSubjectId) {
			setNotification(
				"Please fill in all required fields (date, period, subject)."
			);
			return;
		}

		// 2) Convert final date to midnight UTC
		const utcDate = new Date(finalDate);
		utcDate.setUTCHours(0, 0, 0, 0);

		// 3) Build payload
		const classLogData = {
			departmentId,
			subjectId: finalSubjectId,
			teacherId: user?.id,
			lectureTitle,
			lectureType: "Lecture",
			classDate: utcDate.toISOString(),
			period: finalPeriod,
			absentStudentIds: absentStudents.map((s) => s.value),
			...(classSequence && { sequence: parseInt(classSequence, 10) }),
		};

		setIsLoading(true);
		try {
			const newClassLog = await classLogApi.createClassLogWithAbsences(
				classLogData,
				user.token
			);

			// Update context
			setClassLogs((prevLogs) =>
				prevLogs.map((log) =>
					log.departmentId === departmentId
						? {
								...log,
								subjects: log.subjects.map((subj) =>
									subj.subjectId === finalSubjectId
										? {
												...subj,
												classLogs: [
													...subj.classLogs,
													{
														...newClassLog,
														classLogId: newClassLog.id,
														subjectName: subj.name,
														absentStudents: absentStudents.map((s) => ({
															studentId: s.value,
															name: s.label,
														})),
													},
												],
										  }
										: subj
								),
						  }
						: log
				)
			);

			setNotification("Class log created successfully!");
			onClose();
		} catch (error) {
			console.error("Error creating class log:", error);
			if (error.response && error.response.status === 409) {
				setNotification(`English:
          This day and period has already been logged. Cannot have duplicates.

          Bosnian:
          Ovaj dan i čas su već zabilježeni. Ne može biti duplikata.`);
			} else {
				setNotification("Error creating class log. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	// ---------- RENDER ----------
	return (
		<div className="class-log-form-modal">
			<div className="modal-content">
				{isLoading && <div className="loading-bar"></div>}

				{/* ===== OLD UI (Day + Period) ===== */}
				{!isNewUiMode && (
					<>
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
					</>
				)}

				{/* ===== NEW UI (hide day/period, possibly show subject dropdown) ===== */}
				{isNewUiMode && (
					<>
						{/* If you want the teacher to pick a subject: */}
						<DropdownSelect
							className="dropdown-select"
							label="Subject"
							placeholder="Select a subject"
							value={selectedSubject}
							onChange={(val) => setSelectedSubject(val)}
							options={teacherSubjects}
						/>

						{/* If you'd like to show the locked date/period, you can do so: */}
						{/* <p>Date: {externalDate} | Period: {externalPeriod}</p> */}
					</>
				)}

				{/* ===== COMMON FIELDS ===== */}
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
