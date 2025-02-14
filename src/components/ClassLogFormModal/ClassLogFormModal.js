import React from "react";
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
	Notification,
} from "../ui";

import { CLASS_PERIODS } from "../../constants";

import { useClassLogForm } from "./hooks/useClassLogForm";

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
	const {
		isNewUiMode,
		weekDays,
		selectedDay,
		setSelectedDay,
		classHour,
		setClassHour,
		lectureTitle,
		setLectureTitle,
		classSequence,
		setClassSequence,
		absentStudents,
		setAbsentStudents,
		studentOptions,
		isLoading,
		teacherSubjects,
		selectedSubject,
		setSelectedSubject,
		notifications,
		removeNotification,
		handleSubmit,
	} = useClassLogForm({
		onClose,
		departmentId,
		subjectId,
		disableDayAndPeriodSelection,
		externalDate,
		externalPeriod,
		subjects,
		onSuccess,
	});

	return (
		<div className={`class-log-form-modal ${isNewUiMode ? "new-ui-mode" : ""}`}>
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-content">
				{isLoading && <div className="loading-bar"></div>}

				<Notification
					notifications={notifications}
					removeNotification={removeNotification}
				/>

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
								options={CLASS_PERIODS}
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

				<AbsentStudentsSelect
					studentOptions={studentOptions}
					absentStudents={absentStudents}
					setAbsentStudents={setAbsentStudents}
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
