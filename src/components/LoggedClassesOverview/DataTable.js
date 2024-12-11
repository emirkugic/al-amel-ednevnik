import React from "react";
import ClassLogTableRow from "./ClassLogTableRow";
import "./DataTable.css";

const DataTable = ({ currentLogs, handleDeleteLog }) => {
	return (
		<div className="data-table-container">
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
						/>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default DataTable;
