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
				aria-label="Select Subject"
			>
				{subjects.map((subject) => (
					<option key={subject.id} value={subject.id}>
						{subject.name}
					</option>
				))}
			</select>

			<button className="log-class-button" onClick={handleLogClass}>
				Log class
			</button>

			<input
				type="text"
				placeholder="Search..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				aria-label="Search"
				className="search-input"
			/>

			<div className="sort-export-group">
				<button
					onClick={toggleSortOrder}
					className="sort-button"
					aria-label="Toggle Sort Order"
				>
					{sortOrder === "asc" ? "Oldest First" : "Newest First"}
				</button>

				<button className="export-button" aria-label="Export Logs">
					Export
				</button>
			</div>
		</div>
	);
};

export default Controls;
