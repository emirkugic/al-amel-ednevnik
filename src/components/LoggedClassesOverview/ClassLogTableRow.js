import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./ClassLogTableRow.css";

const ClassLogTableRow = ({ log, handleDeleteLog, handleEditLog, columns }) => {
	const tooltipContent =
		log.absentStudents && log.absentStudents.length > 0
			? log.absentStudents.map((student) => student.name).join("\n")
			: "All present";

	// Check if the log is editable (not older than 5 days)
	const isEditable = () => {
		const today = new Date();
		const logDate = new Date(log.classDate);
		const diffTime = Math.abs(today - logDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 5;
	};

	return (
		<tr className="class-log-table-row">
			<td data-label={columns.date}>
				{new Date(log.classDate).toLocaleDateString()}
			</td>
			<td data-label={columns.subject}>{log.subject}</td>
			<td data-label={columns.period}>{log.period}</td>
			<td data-label={columns.lectureTitle}>{log.lectureTitle}</td>
			<td data-label={columns.sequence}>{log.sequence}</td>
			<td data-label={columns.absentStudents}>
				<div className="attendance-info" data-tooltip={tooltipContent}>
					<span className="absent-count">
						{log.absentStudents?.length || 0} absent
					</span>
				</div>
			</td>
			<td data-label={columns.actions}>
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
