import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./ClassLogTableRow.css";

const ClassLogTableRow = ({ log, handleDeleteLog, columns }) => {
	const tooltipContent =
		log.absentStudents && log.absentStudents.length > 0
			? log.absentStudents.map((student) => student.name).join("\n")
			: "All present";

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
			</td>
		</tr>
	);
};

export default ClassLogTableRow;
