import React, { useState, useEffect } from "react";
import TextInput from "../ui/TextInput/TextInput";
import AbsentStudentsSelect from "../ui/AbsentStudentsSelect/AbsentStudentsSelect";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton";
import studentApi from "../../api/studentApi";
import classLogApi from "../../api/classLogApi";
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

	useEffect(() => {
		if (!log.departmentId) return;

		const fetchStudents = async () => {
			try {
				const students = await studentApi.getStudentsByDepartment(
					log.departmentId,
					user.token
				);

				// Format students for the dropdown
				const formattedStudents = students.map((student) => ({
					value: student.id,
					label: `${student.firstName} ${student.lastName}`,
				}));

				setStudentOptions(formattedStudents);

				// Format absent students to match the dropdown options
				const formattedAbsent = log.absentStudents
					.map((absent) =>
						formattedStudents.find(
							(student) => student.value === absent.studentId
						)
					)
					.filter(Boolean); // Remove unmatched students

				setAbsentStudents(formattedAbsent);
			} catch (error) {
				console.error("Error fetching students:", error);
				setNotification("Error fetching students. Please try again.");
			}
		};

		fetchStudents();
	}, [log.departmentId, user.token, log.absentStudents]);

	const handleSubmit = async () => {
		if (!lectureTitle.trim()) {
			setNotification("Please enter a lecture title.");
			return;
		}

		const updatedLog = {
			lectureTitle,
			lectureType: log.lectureType || "Lecture",
			classDate: log.classDate,
			period: log.period,
			sequence: parseInt(log.sequence, 10) || 1,
			absentStudentIds: absentStudents.map((s) => s.value),
		};

		setIsLoading(true);
		try {
			await classLogApi.updateClassLog(log.classLogId, updatedLog, user.token);

			handleUpdateLog({ ...log, ...updatedLog });

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
