import React, { useState, useEffect, useContext, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPlus,
	faSearch,
	faSort,
	faChevronLeft,
	faChevronRight,
	faEdit,
	faTrash,
	faFileExport,
	faBookOpen,
	faExclamationTriangle,
	faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./LoggedClassesOverview.css";

// Import existing components and APIs
import ClassLogFormModal from "../ClassLogFormModal/ClassLogFormModal";
import EditLogModal from "./EditLogModal";
import teacherApi from "../../api/teacherApi";
import subjectApi from "../../api/subjectApi";
import departmentApi from "../../api/departmentApi";
import useAuth from "../../hooks/useAuth";
import { ClassLogsContext } from "../../contexts/ClassLogsContext";
import classLogApi from "../../api/classLogApi";

const LoggedClassesOverview = ({ departmentId }) => {
	const { user } = useAuth();
	const { classLogs, loading, error, setClassLogs } =
		useContext(ClassLogsContext);

	// State management
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOrder, setSortOrder] = useState("desc");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState("");
	const [subjects, setSubjects] = useState([]);
	const [departmentName, setDepartmentName] = useState("");
	const [editingLog, setEditingLog] = useState(null);

	const logsPerPage = 10;

	// Fetch department name using the departmentId
	useEffect(() => {
		if (departmentId && user?.token) {
			departmentApi
				.getDepartmentById(departmentId, user.token)
				.then((dept) => {
					setDepartmentName(dept.departmentName);
				})
				.catch((err) => {
					console.error("Error fetching department info:", err);
				});
		}
	}, [departmentId, user]);

	// Fetch subjects assigned to the teacher
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
				const subjectsList = resolvedSubjects.map((subject) => ({
					id: subject.id,
					name: subject.name,
				}));

				setSubjects(subjectsList);
				if (subjectsList.length > 0) {
					setSelectedSubject(subjectsList[0].id);
				}
			} catch (error) {
				console.error("Error fetching subjects:", error);
			}
		};

		fetchSubjects();
	}, [user, departmentId]);

	// Get logs for the current department
	const departmentLogs = classLogs.find(
		(log) => log.departmentId === departmentId
	);

	// Filter and sort logs
	const filteredLogs = useMemo(() => {
		if (!departmentLogs) return [];

		return departmentLogs.subjects
			.filter((subject) => subject.subjectId === selectedSubject)
			.flatMap((subject) =>
				subject.classLogs.map((log) => ({
					...log,
					subject: subject.subjectName,
					sequence: log.sequence || 1,
					departmentId: departmentLogs.departmentId,
					subjectId: subject.subjectId,
				}))
			)
			.filter((log) => {
				if (!searchQuery) return true;

				const query = searchQuery.toLowerCase();
				const matchesSubject = log.subject?.toLowerCase().includes(query);
				const matchesTitle = log.lectureTitle.toLowerCase().includes(query);
				const matchesStudent = log.absentStudents?.some((student) =>
					student.name.toLowerCase().includes(query)
				);

				return matchesSubject || matchesTitle || matchesStudent;
			})
			.sort((a, b) => {
				const dateA = new Date(a.classDate);
				const dateB = new Date(b.classDate);
				return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
			});
	}, [departmentLogs, selectedSubject, searchQuery, sortOrder]);

	// Pagination logic
	const indexOfLastLog = currentPage * logsPerPage;
	const indexOfFirstLog = indexOfLastLog - logsPerPage;
	const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
	const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

	// Event handlers
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	const toggleSortOrder = () => {
		setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
	};

	const handleLogClass = () => {
		if (!selectedSubject) {
			alert("No subject selected. Cannot open modal.");
			return;
		}
		setIsModalOpen(true);
	};

	const handleEditLog = (log) => {
		setEditingLog(log);
	};

	const handleDeleteLog = async (logId) => {
		if (!window.confirm("Are you sure you want to delete this log?")) return;

		try {
			await classLogApi.deleteClassLog(logId, user.token);
			setClassLogs((prevLogs) =>
				prevLogs.map((log) =>
					log.departmentId === departmentId
						? {
								...log,
								subjects: log.subjects.map((subject) =>
									subject.subjectId === selectedSubject
										? {
												...subject,
												classLogs: subject.classLogs.filter(
													(classLog) => classLog.classLogId !== logId
												),
										  }
										: subject
								),
						  }
						: log
				)
			);
		} catch (error) {
			console.error("Error deleting class log:", error);
			alert("Failed to delete class log. Please try again.");
		}
	};

	const closeModal = () => setIsModalOpen(false);

	const closeEditModal = () => setEditingLog(null);

	// Called by EditLogModal after a successful update
	const handleUpdateLog = (updatedLog) => {
		setClassLogs((prevLogs) =>
			prevLogs.map((dept) => {
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
								return { ...log, ...updatedLog };
							}),
						};
					}),
				};
			})
		);
	};

	// Check if a log is editable (within 50 days)
	const isEditable = (log) => {
		const today = new Date();
		const logDate = new Date(log.classDate);
		const diffTime = Math.abs(today - logDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 50;
	};

	// Format date for display
	const formatDate = (dateString) => {
		const options = { year: "numeric", month: "short", day: "numeric" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	// Get tooltip content for absent students
	const getAbsentTooltip = (absentStudents) => {
		if (!absentStudents || absentStudents.length === 0) {
			return "All students present";
		}
		return absentStudents.map((student) => student.name).join("\n");
	};

	// Get the selected subject name for display
	const selectedSubjectName = subjects.find(
		(subject) => subject.id === selectedSubject
	)?.name;

	// Render loading state
	if (loading) {
		return (
			<div className="logged-classes-overview">
				<div className="loading-container">
					<div className="loading-spinner"></div>
				</div>
			</div>
		);
	}

	// Render error state
	if (error) {
		return (
			<div className="logged-classes-overview">
				<div className="error-container">
					<FontAwesomeIcon
						icon={faExclamationTriangle}
						className="error-icon"
					/>
					<h3 className="error-title">Unable to load class logs</h3>
					<p className="error-message">{error}</p>
					<button
						className="retry-button"
						onClick={() => window.location.reload()}
					>
						Try again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="logged-classes-overview">
			{/* Header */}
			<div className="overview-header">
				<div className="header-left">
					<h2>
						{selectedSubjectName || "Loading..."} -{" "}
						{departmentName || "Loading..."} razred
					</h2>
					<div className="header-subtitle">
						Track and manage your classroom activities
					</div>
				</div>
			</div>

			{/* Controls */}
			<div className="overview-controls">
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

				<button className="log-class-button" onClick={handleLogClass}>
					<FontAwesomeIcon icon={faPlus} /> Log Class
				</button>

				<div className="search-container">
					<FontAwesomeIcon icon={faSearch} className="search-icon" />
					<input
						type="text"
						className="search-input"
						placeholder="Search logs..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<div className="view-buttons">
					<button className="sort-button" onClick={toggleSortOrder}>
						<FontAwesomeIcon icon={faSort} />
						{sortOrder === "asc" ? "Oldest first" : "Newest first"}
					</button>

					<button className="export-button">
						<FontAwesomeIcon icon={faFileExport} /> Export
					</button>
				</div>
			</div>

			{/* Content */}
			<div className="overview-content">
				{/* Desktop table view */}
				<div className="logs-table-container">
					{filteredLogs.length > 0 ? (
						<table className="logs-table">
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
									<tr key={log.classLogId}>
										<td className="date-cell">{formatDate(log.classDate)}</td>
										<td className="subject-cell">{log.subject}</td>
										<td>{log.period}</td>
										<td className="title-cell" title={log.lectureTitle}>
											{log.lectureTitle}
										</td>
										<td className="sequence-cell">{log.sequence}</td>
										<td>
											<div className="absent-info">
												<span className="absent-count">
													{log.absentStudents?.length || 0} absent
												</span>
												<div className="absent-tooltip">
													{getAbsentTooltip(log.absentStudents)}
												</div>
											</div>
										</td>
										<td>
											<div className="action-buttons">
												{isEditable(log) && (
													<button
														className="edit-button"
														onClick={() => handleEditLog(log)}
														title="Edit log"
													>
														<FontAwesomeIcon icon={faEdit} />
													</button>
												)}
												<button
													className="delete-button"
													onClick={() => handleDeleteLog(log.classLogId)}
													title="Delete log"
												>
													<FontAwesomeIcon icon={faTrash} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<div className="empty-state">
							<FontAwesomeIcon icon={faBookOpen} className="empty-icon" />
							<h3 className="empty-title">No class logs found</h3>
							<p className="empty-text">
								{searchQuery
									? "No logs match your search criteria. Try adjusting your search or clear the search box."
									: "Start tracking your classes by adding your first log."}
							</p>
							<button className="log-class-button" onClick={handleLogClass}>
								<FontAwesomeIcon icon={faPlus} /> Log your first class
							</button>
						</div>
					)}
				</div>

				{/* Mobile card view */}
				<div className="mobile-logs">
					{filteredLogs.length > 0 ? (
						currentLogs.map((log) => (
							<div className="log-card" key={log.classLogId}>
								<div className="card-header">
									<div className="card-subject">{log.subject}</div>
									<div className="card-date">{formatDate(log.classDate)}</div>
								</div>
								<div className="card-body">
									<div className="card-title">{log.lectureTitle}</div>
									<div className="card-details">
										<div className="detail-item">
											<div className="detail-label">Period</div>
											<div className="detail-value">{log.period}</div>
										</div>
										<div className="detail-item">
											<div className="detail-label">Sequence</div>
											<div className="detail-value">{log.sequence}</div>
										</div>
										<div className="detail-item">
											<div className="detail-label">Absent Students</div>
											<div className="detail-value">
												{log.absentStudents?.length || 0} students
											</div>
										</div>
										{log.absentStudents?.length > 0 && (
											<div className="detail-item">
												<div className="detail-label">
													<FontAwesomeIcon icon={faInfoCircle} /> Who's absent
												</div>
												<div className="detail-value">
													{log.absentStudents.map((s) => s.name).join(", ")}
												</div>
											</div>
										)}
									</div>
								</div>
								<div className="card-footer">
									{isEditable(log) && (
										<button
											className="card-button card-edit"
											onClick={() => handleEditLog(log)}
										>
											<FontAwesomeIcon icon={faEdit} /> Edit
										</button>
									)}
									<button
										className="card-button card-delete"
										onClick={() => handleDeleteLog(log.classLogId)}
									>
										<FontAwesomeIcon icon={faTrash} /> Delete
									</button>
								</div>
							</div>
						))
					) : (
						<div className="empty-state">
							<FontAwesomeIcon icon={faBookOpen} className="empty-icon" />
							<h3 className="empty-title">No class logs found</h3>
							<p className="empty-text">
								{searchQuery
									? "No logs match your search criteria."
									: "Add your first class log to get started."}
							</p>
							<button className="log-class-button" onClick={handleLogClass}>
								<FontAwesomeIcon icon={faPlus} /> Log Class
							</button>
						</div>
					)}
				</div>

				{/* Pagination */}
				{filteredLogs.length > 0 && (
					<div className="pagination">
						<div className="pagination-info">
							Showing {indexOfFirstLog + 1} to{" "}
							{Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
							{filteredLogs.length} entries
						</div>
						<div className="pagination-buttons">
							<button
								className="page-button"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
							>
								<FontAwesomeIcon icon={faChevronLeft} />
							</button>

							{Array.from({ length: totalPages }, (_, i) => i + 1)
								.filter(
									(page) =>
										page === 1 ||
										page === totalPages ||
										(page >= currentPage - 1 && page <= currentPage + 1)
								)
								.map((page, index, array) => (
									<React.Fragment key={page}>
										{index > 0 && array[index - 1] !== page - 1 && (
											<span
												className="page-button"
												style={{ cursor: "default" }}
											>
												...
											</span>
										)}
										<button
											className={`page-button ${
												page === currentPage ? "active" : ""
											}`}
											onClick={() => handlePageChange(page)}
										>
											{page}
										</button>
									</React.Fragment>
								))}

							<button
								className="page-button"
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
							>
								<FontAwesomeIcon icon={faChevronRight} />
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Modals */}
			{isModalOpen && (
				<ClassLogFormModal
					onClose={closeModal}
					departmentId={departmentId}
					subjectId={selectedSubject}
				/>
			)}

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

export default LoggedClassesOverview;
