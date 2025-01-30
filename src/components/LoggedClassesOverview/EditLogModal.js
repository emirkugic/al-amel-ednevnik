import React, { useState, useEffect } from "react";
import TextInput from "../ui/TextInput/TextInput";
import AbsentStudentsSelect from "../ui/AbsentStudentsSelect/AbsentStudentsSelect";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton";
import studentApi from "../../api/studentApi";
import classLogApi from "../../api/classLogApi"; // ✅ API import
import useAuth from "../../hooks/useAuth";
import "./EditLogModal.css";
import { faChalkboardTeacher } from "@fortawesome/free-solid-svg-icons";

const EditLogModal = ({ log, onClose, handleUpdateLog }) => {
	const { user } = useAuth();
	const [lectureTitle, setLectureTitle] = useState(log.lectureTitle || "");
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentOptions, setStudentOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [notification, setNotification] = useState("");

	// ✅ Fetch students when the modal opens
	useEffect(() => {
		if (!log.departmentId) return;

		const fetchStudents = async () => {
			try {
				const students = await studentApi.getStudentsByDepartment(
					log.departmentId,
					user.token
				);

				const formattedStudents = students.map((student) => ({
					value: student.id,
					label: `${student.firstName} ${student.lastName}`,
				}));

				setStudentOptions(formattedStudents);

				// ✅ Correct absent students format
				const formattedAbsent = log.absentStudents
					.map((s) => formattedStudents.find((stu) => stu.value === s.id))
					.filter(Boolean);
				setAbsentStudents(formattedAbsent);
			} catch (error) {
				console.error("Error fetching students:", error);
				setNotification("Error fetching students. Please try again.");
			}
		};

		fetchStudents();
	}, [log.departmentId, user.token, log.absentStudents]);

	// ✅ Submit the edited log
	const handleSubmit = async () => {
		if (!lectureTitle.trim()) {
			setNotification("Please enter a lecture title.");
			return;
		}

		// ✅ Prepare request data matching UpdateClassLogDto
		const updatedLog = {
			lectureTitle,
			lectureType: log.lectureType || "Lecture", // Default value
			classDate: log.classDate, // Keep existing date
			period: log.period,
			sequence: parseInt(log.sequence, 10) || 1, // Ensure it's a number
			absentStudentIds: absentStudents.map((s) => s.value),
		};

		console.log("Request Body:", JSON.stringify(updatedLog, null, 2));

		setIsLoading(true);
		try {
			// ✅ Call API to update class log
			await classLogApi.updateClassLog(log.classLogId, updatedLog, user.token);

			// ✅ Update UI state after successful update
			handleUpdateLog({ ...log, ...updatedLog });

			// ✅ Close modal after success
			onClose();
		} catch (error) {
			console.error("Error updating log:", error);
			setNotification("Error updating log. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="edit-log-modal-overlay">
			<div className="edit-log-modal">
				{isLoading && <div className="loading-bar"></div>}

				<h2>Edit Class Log</h2>

				<TextInput
					label="Lecture Title"
					icon={faChalkboardTeacher}
					placeholder="Enter lecture title"
					value={lectureTitle}
					onChange={(e) => setLectureTitle(e.target.value)}
				/>

				<AbsentStudentsSelect
					studentOptions={studentOptions}
					absentStudents={absentStudents}
					setAbsentStudents={setAbsentStudents}
					setNotification={setNotification}
				/>

				{notification && <p className="notification">{notification}</p>}

				<div className="modal-actions">
					<SecondaryButton title="Cancel" onClick={onClose} />
					<PrimaryButton title="Save Changes" onClick={handleSubmit} />
				</div>
			</div>
		</div>
	);
};

export default EditLogModal;
