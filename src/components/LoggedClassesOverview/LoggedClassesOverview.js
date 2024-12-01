import React, { useState, useEffect, useContext } from "react";
import "./LoggedClassesOverview.css";
import ClassLogFormModal from "../ClassLogFormModal/ClassLogFormModal";
import teacherApi from "../../api/teacherApi";
import subjectApi from "../../api/subjectApi";
import useAuth from "../../hooks/useAuth";
import { ClassLogsContext } from "../../contexts/ClassLogsContext";

const LoggedClassesOverview = ({ departmentId }) => {
	const { user } = useAuth();
	const { classLogs, loading, error } = useContext(ClassLogsContext);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOrder, setSortOrder] = useState("desc");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState("");
	const [subjects, setSubjects] = useState([]);
	const logsPerPage = 10;

	useEffect(() => {
		const fetchSubjects = async () => {
			if (!user?.id || !user?.token) return;

			try {
				const teacherData = await teacherApi.getTeacherById(
					user.id,
					user.token
				);

				const filteredSubjects = teacherData.assignedSubjects
					.filter((subject) => subject.departmentId.includes(departmentId))
					.map((subject) => subject.subjectId);

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

	const departmentLogs = classLogs.find(
		(log) => log.departmentId === departmentId
	);

	const filteredLogs =
		departmentLogs?.subjects
			.filter(
				(subject) => !selectedSubject || subject.subjectId === selectedSubject
			)
			.flatMap((subject) =>
				subject.classLogs.map((log) => ({
					...log,
					subject: subject.subjectName,
					sequence: log.sequence || 1,
				}))
			)
			.filter((log) => {
				const matchesSearch =
					log.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					log.lectureTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
					log.absentStudents.some((student) =>
						student.name.toLowerCase().includes(searchQuery.toLowerCase())
					);
				return matchesSearch;
			}) || [];

	const sortedLogs = filteredLogs.sort((a, b) => {
		const dateA = new Date(a.classDate);
		const dateB = new Date(b.classDate);
		return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
	});

	const indexOfLastLog = currentPage * logsPerPage;
	const indexOfFirstLog = indexOfLastLog - logsPerPage;
	const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
	const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

	const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
	const toggleSortOrder = () =>
		setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
	const closeModal = () => setIsModalOpen(false);

	const handleLogClass = () => {
		if (!selectedSubject) {
			alert("No subject selected. Cannot open modal.");
			return;
		}
		console.log("Opening modal with Subject ID:", selectedSubject); // Debugging log
		setIsModalOpen(true);
	};

	return (
		<div className="logged-classes-overview">
			<h2>Class Logs</h2>
			<p>Track and manage your class sessions</p>
			{loading && <p>Loading class logs...</p>}
			{error && <p>Error: {error}</p>}
			{!loading && !error && (
				<>
					<div className="controls">
						<select
							className="subject-dropdown"
							value={selectedSubject}
							onChange={(e) => setSelectedSubject(e.target.value)}
							disabled={subjects.length === 0}
						>
							<option value="">All Subjects</option>
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
									<th>Subject</th>
									<th>Period</th>
									<th>Lecture Title</th>
									<th>Sequence</th>
									<th>Absent Students</th>
								</tr>
							</thead>
							<tbody>
								{currentLogs.map((log, index) => (
									<tr key={log.classLogId}>
										<td>{new Date(log.classDate).toLocaleDateString()}</td>
										<td>{log.subject}</td>
										<td>{log.period}</td>
										<td>{log.lectureTitle}</td>
										<td>{log.sequence}</td>
										<td>
											{log.absentStudents.length > 0
												? log.absentStudents
														.map((student) => student.name)
														.join(", ")
												: "All present"}
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
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => (
									<button
										key={page}
										onClick={() => handlePageChange(page)}
										className={page === currentPage ? "active" : ""}
									>
										{page}
									</button>
								)
							)}
							<button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
							>
								»
							</button>
						</div>
					</div>

					{isModalOpen && (
						<ClassLogFormModal
							onClose={closeModal}
							departmentId={departmentId}
							subjectId={selectedSubject}
						/>
					)}
				</>
			)}
		</div>
	);
};

export default LoggedClassesOverview;
