import React, { useState } from "react";
import ClassLogTableRow from "./ClassLogTableRow";
import "./DataTable.css";
import useAuth from "../../hooks/useAuth";
import EditLogModal from "./EditLogModal";

const DataTable = ({ currentLogs, handleDeleteLog, setClassLogs }) => {
	const { user } = useAuth();

	// Keep track of which log is being edited (null if none)
	const [editingLog, setEditingLog] = useState(null);

	// Decide whether a log is editable based on the date
	const isEditable = (log) => {
		const today = new Date();
		const logDate = new Date(log.classDate);
		const diffTime = Math.abs(today - logDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 50; // or your desired cutoff
	};

	// When user clicks "Edit"
	const handleEditLog = (log) => {
		setEditingLog(log);
	};

	// Closes the edit modal
	const closeEditModal = () => {
		setEditingLog(null);
	};

	// Called by EditLogModal after a successful update
	const handleUpdateLog = (updatedLog) => {
		// If you prefer to do a full page reload, you can skip this.
		// Otherwise, update the local state so the table re-renders:
		setClassLogs((prevLogs) =>
			prevLogs.map((dept) => {
				// Each item is { departmentId, subjects: [...] }
				if (dept.departmentId !== updatedLog.departmentId) return dept;

				return {
					...dept,
					subjects: dept.subjects.map((subj) => {
						if (subj.subjectId !== updatedLog.subjectId) return subj;

						return {
							...subj,
							classLogs: subj.classLogs.map((log) => {
								if (log.classLogId !== updatedLog.classLogId) {
									return log;
								}
								// Merge the updated fields
								return { ...log, ...updatedLog };
							}),
						};
					}),
				};
			})
		);
	};

	return (
		<div className="data-table-wrapper">
			{/* Desktop Table View */}
			<div className="data-table-container desktop-view">
				<table className="log-table">
					<thead>
						<tr>
							<th>Date</th>
							<th>Subject</th>
							<th>Period</th>
							<th>Lecture Title</th>
							<th>Sequence</th>
							<th>Absent Students</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{currentLogs.map((log) => (
							<ClassLogTableRow
								key={log.classLogId}
								log={log}
								handleDeleteLog={handleDeleteLog}
								handleEditLog={handleEditLog}
							/>
						))}
					</tbody>
				</table>
			</div>

			{/* Mobile List View */}
			<div className="mobile-log-list">
				{currentLogs.map((log) => (
					<div className="mobile-log-card" key={log.classLogId}>
						<div className="log-header">
							<strong>{log.subject}</strong>
							<span>{new Date(log.classDate).toLocaleDateString()}</span>
						</div>
						<div className="log-body">
							<p>
								<strong>Lecture:</strong> {log.lectureTitle}
							</p>
							<p>
								<strong>Period:</strong> {log.period} |{" "}
								<strong>Sequence:</strong> {log.sequence}
							</p>
							<p>
								<strong>Absent:</strong>{" "}
								{log.absentStudents?.length
									? log.absentStudents.length
									: "None"}
							</p>
						</div>
						<div className="log-actions">
							{/* Only show Edit if still editable */}
							{isEditable(log) && (
								<button className="edit-btn" onClick={() => handleEditLog(log)}>
									Edit
								</button>
							)}
							<button
								className="delete-btn"
								onClick={() => handleDeleteLog(log.classLogId)}
							>
								Delete
							</button>
						</div>
					</div>
				))}
			</div>

			{editingLog && (
				<EditLogModal
					log={editingLog}
					onClose={closeEditModal}
					handleUpdateLog={handleUpdateLog}
				/>
			)}
		</div>
	);
};

export default DataTable;
