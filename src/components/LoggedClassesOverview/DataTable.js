import React, { useState } from "react";
import ClassLogTableRow from "./ClassLogTableRow";
import MobileLogDetailsModal from "./MobileLogDetailsModal";
import EditLogModal from "./EditLogModal"; // Import the new EditLogModal component
import "./DataTable.css";

const DataTable = ({ currentLogs, handleDeleteLog, setClassLogs }) => {
	const [selectedLog, setSelectedLog] = useState(null);
	const [editingLog, setEditingLog] = useState(null); // Track the log being edited

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

	const handleEditLog = (log) => {
		setEditingLog(log); // Open the edit modal with the selected log
	};

	const closeEditModal = () => {
		setEditingLog(null); // Close the edit modal
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
								handleEditLog={handleEditLog}
								columns={columns}
							/>
						))}
					</tbody>
				</table>
			</div>

			{selectedLog && (
				<MobileLogDetailsModal
					log={selectedLog}
					onClose={closeLogDetails}
					onDelete={handleDeleteAndClose}
				/>
			)}

			{editingLog && (
				<EditLogModal
					log={editingLog}
					onClose={closeEditModal}
					handleUpdateLog={(updatedLog) => {
						// Replace the log with the updated version
						setClassLogs((prevLogs) =>
							prevLogs.map((log) =>
								log.classLogId === updatedLog.classLogId ? updatedLog : log
							)
						);
					}}
				/>
			)}
		</div>
	);
};

export default DataTable;
