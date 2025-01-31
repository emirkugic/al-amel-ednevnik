import React, { useState } from "react";
import ClassLogTableRow from "./ClassLogTableRow";
import MobileLogDetailsModal from "./MobileLogDetailsModal";
import EditLogModal from "./EditLogModal"; // Import the new EditLogModal component
import "./DataTable.css";
import classLogApi from "../../api/classLogApi";
import useAuth from "../../hooks/useAuth";

const DataTable = ({ currentLogs, handleDeleteLog, setClassLogs }) => {
	const [selectedLog, setSelectedLog] = useState(null);
	const [editingLog, setEditingLog] = useState(null); // Track the log being edited
	const { user } = useAuth();

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
						setClassLogs((prevLogs) => {
							const newLogs = prevLogs.map((log) => {
								if (log.departmentId !== updatedLog.departmentId) return log;

								const updatedSubjects = log.subjects.map((subject) => {
									if (subject.subjectId !== updatedLog.subjectId)
										return subject;

									const updatedClassLogs = subject.classLogs.map((classLog) =>
										classLog.classLogId === updatedLog.classLogId
											? { ...classLog, ...updatedLog }
											: classLog
									);

									return { ...subject, classLogs: [...updatedClassLogs] };
								});

								return { ...log, subjects: [...updatedSubjects] };
							});
							window.location.reload();
							// TODO: Remove the reload and update the state properly
							return [...newLogs];
						});
					}}
				/>
			)}
		</div>
	);
};

export default DataTable;
