import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoggedClassesOverview.css";
import ClassLogFormModal from "../ClassLogFormModal/ClassLogFormModal";
import teacherApi from "../../api/teacherApi";
import subjectApi from "../../api/subjectApi";
import useAuth from "../../hooks/useAuth";

const LoggedClassesOverview = ({ initialLogs = [], departmentId }) => {
	const { user } = useAuth(); // Get the logged-in user info
	const navigate = useNavigate();
	const location = useLocation();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGrade, setSelectedGrade] = useState("All Grades");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOrder, setSortOrder] = useState("desc"); // Default to descending order
	const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
	const [selectedSubject, setSelectedSubject] = useState(""); // State for selected subject
	const [subjects, setSubjects] = useState([]); // State for filtered subjects
	const logsPerPage = 10;

	const logs = initialLogs;

	// Fetch and filter subjects based on departmentId
	useEffect(() => {
		const fetchSubjects = async () => {
			if (!user?.id || !user?.token) return;

			try {
				const teacherData = await teacherApi.getTeacherById(
					user.id,
					user.token
				);

				// Filter assigned subjects based on departmentId
				const filteredSubjects = teacherData.assignedSubjects
					.filter((subject) => subject.departmentId.includes(departmentId))
					.map((subject) => subject.subjectId);

				// Fetch subject details for filtered subjects
				const subjectPromises = filteredSubjects.map((id) =>
					subjectApi.getSubjectById(id, user.token)
				);

				const resolvedSubjects = await Promise.all(subjectPromises);

				setSubjects(
					resolvedSubjects.map((subject) => ({
						id: subject.id,
						name: subject.name,
					}))
				);
			} catch (error) {
				console.error("Error fetching subjects:", error);
			}
		};

		fetchSubjects();
	}, [user, departmentId]);

	const handleSubjectChange = (subjectId) => {
		setSelectedSubject(subjectId);
		if (subjectId) {
			navigate(`${location.pathname}/${subjectId}`);
		} else {
			navigate(location.pathname); // Reset URL if no subject is selected
		}
	};

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

	return (
		<div className="logged-classes-overview">
			<h2>Class Logs</h2>
			<p>Track and manage your class sessions</p>
			<div className="controls">
				<select
					className="subject-dropdown"
					value={selectedSubject}
					onChange={(e) => handleSubjectChange(e.target.value)}
					disabled={subjects.length === 0}
				>
					<option value="">Select Subject</option>
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
										<strong>{log.subject || "N/A"}</strong>
										<span>{log.grade || "N/A"}</span>
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
				<ClassLogFormModal
					onClose={closeModal}
					departmentId={departmentId}
					subjectId={selectedSubject}
				/>
			)}
		</div>
	);
};

export default LoggedClassesOverview;
