import React, { useState } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { Notification } from "../../../components/ui";
import "./AbsentStudentsSelect.css";

const AbsentStudentsSelect = ({
	studentOptions,
	absentStudents,
	setAbsentStudents,
}) => {
	const [notifications, setNotifications] = useState([]);

	const addNotification = (message, type = "error") => {
		const id = Date.now();
		setNotifications((prev) => [...prev, { id, description: message, type }]);

		setTimeout(() => {
			removeNotification(id);
		}, 3000);
	};

	const removeNotification = (id) => {
		setNotifications((prev) =>
			prev.filter((notification) => notification.id !== id)
		);
	};

	const addAbsentStudent = (option) => {
		if (
			option &&
			!absentStudents.some((student) => student.value === option.value)
		) {
			setAbsentStudents((prev) => [...prev, option]);
		} else {
			addNotification(
				"Duplicate entry: You cannot report the same student absent multiple times for the same period."
			);
		}
	};

	const removeAbsentStudent = (index) => {
		setAbsentStudents((prev) => {
			const newAbsentStudents = [...prev];
			newAbsentStudents.splice(index, 1);
			return newAbsentStudents;
		});
	};

	const filteredOptions = studentOptions.filter(
		(option) =>
			!absentStudents.some((student) => student.value === option.value)
	);

	return (
		<div className="form-group">
			<Notification
				notifications={notifications}
				removeNotification={removeNotification}
			/>
			<div className="absent-students-header">
				<FontAwesomeIcon icon={faUserPlus} className="header-icon" />
				<span>Absent Students</span>
			</div>
			<Select
				isClearable
				isSearchable={false}
				onChange={addAbsentStudent}
				options={filteredOptions}
				placeholder="Select a student..."
			/>
			<div
				className={`absent-students-list ${
					absentStudents.length > 2 ? "scrollable" : ""
				}`}
			>
				{absentStudents.map((student, index) => (
					<div key={index} className="student-name">
						<span>{student.label}</span>
						<button
							onClick={() => removeAbsentStudent(index)}
							className="remove-student-btn"
						>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default AbsentStudentsSelect;
