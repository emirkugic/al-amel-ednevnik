import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./ClassLogTableRow.css";

const ClassLogTableRow = ({ log, handleDeleteLog, handleEditLog }) => {
	// Same 50-day check from DataTable.
	// You could define it here or pass it down as a prop.
	const isEditable = () => {
		const today = new Date();
		const logDate = new Date(log.classDate);
		const diffTime = Math.abs(today - logDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 50;
	};

	// Tooltip for absent students
	const tooltipContent =
		log.absentStudents.length > 0
			? log.absentStudents.map((student) => student.name).join("\n")
			: "All present";

	return (
		<tr className="class-log-table-row">
			<td data-label="Date">{new Date(log.classDate).toLocaleDateString()}</td>
			<td data-label="Subject">{log.subject}</td>
			<td data-label="Period">{log.period}</td>
			<td data-label="Lecture Title">{log.lectureTitle}</td>
			<td data-label="Sequence">{log.sequence}</td>
			<td data-label="Absent Students">
				<div className="attendance-info" data-tooltip={tooltipContent}>
					<span className="absent-count">
						{log.absentStudents?.length || 0} absent
					</span>
				</div>
			</td>
			<td data-label="Actions">
				<button
					className="delete-log-button"
					onClick={() => handleDeleteLog(log.classLogId)}
				>
					<FontAwesomeIcon icon={faTrash} />
				</button>
				{isEditable() && (
					<button
						className="edit-log-button"
						onClick={() => handleEditLog(log)}
					>
						<FontAwesomeIcon icon={faEdit} />
					</button>
				)}
			</td>
		</tr>
	);
};

export default ClassLogTableRow;
