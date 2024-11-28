import React, { useState } from "react";
import "./LoggedClassesOverview.css";
import ClassLogFormModal from "../ClassLogFormModal/ClassLogFormModal";

const LoggedClassesOverview = ({ initialLogs = [], departmentId }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGrade, setSelectedGrade] = useState("All Grades");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOrder, setSortOrder] = useState("desc"); // Default to descending order
	const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
	const [selectedSubject, setSelectedSubject] = useState(""); // State for selected subject
	const logsPerPage = 10;

	// Use initialLogs if no logs are explicitly passed
	const logs = initialLogs;

	// Filter logs based on search query and selected grade
	const filteredLogs = logs.filter((log) => {
		const matchesSearch =
			log.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			log.lectureTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
			log.absentStudents.some((student) =>
				student.toLowerCase().includes(searchQuery.toLowerCase())
			);
		const matchesGrade =
			selectedGrade === "All Grades" || log.grade === selectedGrade;
		return matchesSearch && matchesGrade;
	});

	// Sort logs based on sequence and selected order
	const sortedLogs = filteredLogs.sort((a, b) => {
		const sequenceA = parseInt(a.sequence, 10);
		const sequenceB = parseInt(b.sequence, 10);
		return sortOrder === "asc" ? sequenceA - sequenceB : sequenceB - sequenceA;
	});

	// Pagination calculations
	const indexOfLastLog = currentPage * logsPerPage;
	const indexOfFirstLog = indexOfLastLog - logsPerPage;
	const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
	const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

	const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

	const toggleSortOrder = () => {
		setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
	};

	const handleLogClass = () => {
		setIsModalOpen(true); // Open the modal
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const subjects = ["Mathematics", "Physics", "Chemistry"];

	return (
		<div className="logged-classes-overview">
			<h2>Class Logs</h2>
			<p>Track and manage your class sessions</p>
			<div className="controls">
				<select
					className="subject-dropdown"
					value={selectedSubject}
					onChange={(e) => {
						const subject = e.target.value;
						console.log(`Selected Subject: ${subject}`);
						setSelectedSubject(subject); // Update state with selected subject
					}}
					disabled={subjects.length === 1} // Disable dropdown if only one option
				>
					{subjects.length !== 1 && <option value="">Select Subject</option>}
					{subjects.map((subject, index) => (
						<option key={index} value={subject}>
							{subject}
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

			<div className="data-table-container">
				<table className="log-table">
					<thead>
						<tr>
							<th>Date</th>
							<th>Subject & Grade</th>
							<th>Period</th>
							<th>Lecture Title</th>
							<th>Sequence</th>
							<th>Attendance</th>
						</tr>
					</thead>
					<tbody>
						{currentLogs.map((log, index) => (
							<tr key={index}>
								<td>{log.date}</td>
								<td>
									<div className="subject-grade">
										<strong>{log.subject || "Mathematics"}</strong>
										<span>{log.grade || "10"}</span>
									</div>
								</td>
								<td>{log.period}</td>
								<td>{log.lectureTitle}</td>
								<td>{`${log.sequence} / ${logs.length}`}</td>
								<td>
									<div
										className="attendance-info"
										data-tooltip={`${
											log.absentStudents.join(", ") || "All present"
										}`}
									>
										{`${log.attendance.present} / ${log.attendance.total}`}
										<br />
										<span className="absent-count">
											{log.attendance.absent} absent
										</span>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="pagination">
				<div>
					Showing {indexOfFirstLog + 1} to{" "}
					{Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
					{filteredLogs.length} entries
				</div>
				<div className="page-controls">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
					>
						«
					</button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<button
							key={page}
							onClick={() => handlePageChange(page)}
							className={page === currentPage ? "active" : ""}
						>
							{page}
						</button>
					))}
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						»
					</button>
				</div>
			</div>

			{/* Modal */}
			{isModalOpen && (
				<ClassLogFormModal onClose={closeModal} departmentId={departmentId} />
			)}
		</div>
	);
};

export default LoggedClassesOverview;
