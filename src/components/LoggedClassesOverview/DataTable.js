import React, { useState } from "react";
import ClassLogTableRow from "./ClassLogTableRow";
import MobileLogDetailsModal from "./MobileLogDetailsModal";
import "./DataTable.css";

const DataTable = ({ currentLogs, handleDeleteLog }) => {
	const [selectedLog, setSelectedLog] = useState(null);

	const columns = {
		date: "Date",
		subject: "Subject",
		period: "Period",
		lectureTitle: "Lecture Title",
		sequence: "Sequence",
		absentStudents: "Absent Students",
		actions: "Actions",
	};

	const openLogDetails = (log) => {
		setSelectedLog(log);
	};

	const closeLogDetails = () => {
		setSelectedLog(null);
	};

	const handleDeleteAndClose = (logId) => {
		handleDeleteLog(logId);
		closeLogDetails();
	};

	return (
		<div className="data-table-wrapper">
			<div className="data-table-container">
				<table className="log-table">
					<thead>
						<tr>
							<th>{columns.date}</th>
							<th>{columns.subject}</th>
							<th>{columns.period}</th>
							<th>{columns.lectureTitle}</th>
							<th>{columns.sequence}</th>
							<th>{columns.absentStudents}</th>
							<th>{columns.actions}</th>
						</tr>
					</thead>
					<tbody>
						{currentLogs.map((log) => (
							<ClassLogTableRow
								key={log.classLogId}
								log={log}
								handleDeleteLog={handleDeleteLog}
								columns={columns}
							/>
						))}
					</tbody>
				</table>
			</div>

			<div className="log-list">
				{currentLogs.map((log) => (
					<div
						key={log.classLogId}
						className="log-list-item"
						onClick={() => openLogDetails(log)}
					>
						<div className="log-item-row">
							<span className="log-item-label">Date:</span>
							<span>{new Date(log.classDate).toLocaleDateString()}</span>
						</div>
						<div className="log-item-row">
							<span className="log-item-label">Period:</span>
							<span>{log.period}</span>
						</div>
						<div className="log-item-row">
							<span className="log-item-label">Title:</span>
							<span>{log.lectureTitle}</span>
						</div>
						<div className="log-item-row">
							<span className="log-item-label">Seq:</span>
							<span>{log.sequence}</span>
						</div>
						<div className="log-item-more">Tap for more details</div>
					</div>
				))}
			</div>

			{selectedLog && (
				<MobileLogDetailsModal
					log={selectedLog}
					onClose={closeLogDetails}
					onDelete={handleDeleteAndClose}
				/>
			)}
		</div>
	);
};

export default DataTable;
