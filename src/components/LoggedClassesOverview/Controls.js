import React from "react";
import "./Controls.css";

const Controls = ({
	subjects,
	selectedSubject,
	setSelectedSubject,
	searchQuery,
	setSearchQuery,
	sortOrder,
	toggleSortOrder,
	handleLogClass,
}) => {
	return (
		<div className="controls">
			<select
				className="subject-dropdown"
				value={selectedSubject}
				onChange={(e) => setSelectedSubject(e.target.value)}
				disabled={subjects.length <= 1}
			>
				{subjects.map((subject) => (
					<option key={subject.id} value={subject.id}>
						{subject.name}
					</option>
				))}
			</select>
			<input
				type="text"
				placeholder="Search by subject, lecture title, or students..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
			<button onClick={toggleSortOrder} className="sort-button">
				{sortOrder === "asc" ? "Oldest First" : "Newest First"}
			</button>
			<button className="export-button">Export Logs</button>
			<button className="log-class-button" onClick={handleLogClass}>
				Log class
			</button>
		</div>
	);
};

export default Controls;
