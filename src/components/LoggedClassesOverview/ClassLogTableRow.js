import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./ClassLogTableRow.css";

const ClassLogTableRow = ({ log, handleDeleteLog }) => {
	const tooltipContent =
		log.absentStudents && log.absentStudents.length > 0
			? log.absentStudents.map((student) => student.name).join("\n")
			: "All present";

	return (
		<tr>
			<td>{new Date(log.classDate).toLocaleDateString()}</td>
			<td>{log.subject}</td>
			<td>{log.period}</td>
			<td>{log.lectureTitle}</td>
			<td>{log.sequence}</td>
			<td>
				<div className="attendance-info" data-tooltip={tooltipContent}>
					<span className="absent-count">
						{log.absentStudents?.length || 0} absent
					</span>
				</div>
			</td>
			<td>
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
