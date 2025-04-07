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
	faCalendarAlt,
	faUserGraduate,
	faChalkboardTeacher,
	faListOl,
	faClipboardList,
	faFilter,
	faEllipsisV,
	faTimes,
	faCheckCircle,
	faTimesCircle,
	faAngleDown,
	faAngleUp,
} from "@fortawesome/free-solid-svg-icons";
import "./LoggedClassesOverview.css";

// Import existing components and APIs
import ClassLogFormModal from "../../../components/ClassLogFormModal/ClassLogFormModal";
import LogDetailsModal from "../../../components/LogDetailsModal/LogDetailsModal";
import EditLogModal from "../../../components/EditLogModal/EditLogModal";
import teacherApi from "../../../api/teacherApi";
import subjectApi from "../../../api/subjectApi";
import departmentApi from "../../../api/departmentApi";
import useAuth from "../../../hooks/useAuth";
import { ClassLogsContext } from "../../../contexts/ClassLogsContext";
import classLogApi from "../../../api/classLogApi";
import { useLanguage } from "../../../contexts/LanguageContext";

const LoggedClassesOverview = ({ departmentId }) => {
	const { user } = useAuth();
	const { t } = useLanguage();
	const { classLogs, loading, error, setClassLogs } =
		useContext(ClassLogsContext);

	// State management
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOrder, setSortOrder] = useState("desc"); // Default to descending order
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState("");
	const [subjects, setSubjects] = useState([]);
	const [departmentName, setDepartmentName] = useState("");
	const [editingLog, setEditingLog] = useState(null);
	const [viewMode, setViewMode] = useState("table"); // "table", "card", or "calendar"
	const [expandedCards, setExpandedCards] = useState({});

	// New state for details modal
	const [selectedLogForDetails, setSelectedLogForDetails] = useState(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

	const logsPerPage = 15;

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
				const sequenceA = a.sequence;
				const sequenceB = b.sequence;
				return sortOrder === "desc"
					? sequenceB - sequenceA
					: sequenceA - sequenceB;
			});
	}, [departmentLogs, selectedSubject, searchQuery, sortOrder]);

	// Calculate summary statistics
	const summaryStats = useMemo(() => {
		if (!filteredLogs.length) {
			return {
				totalLogs: 0,
				recentLogs: 0,
				totalAbsences: 0,
				editableLogs: 0,
			};
		}

		const now = new Date();
		const thirtyDaysAgo = new Date(now);
		thirtyDaysAgo.setDate(now.getDate() - 30);

		const recentLogs = filteredLogs.filter(
			(log) => new Date(log.classDate) >= thirtyDaysAgo
		).length;

		const totalAbsences = filteredLogs.reduce(
			(sum, log) => sum + (log.absentStudents?.length || 0),
			0
		);

		// Count how many logs are still editable (within 50 days)
		const editableLogs = filteredLogs.filter((log) => {
			const logDate = new Date(log.classDate);
			const diffTime = Math.abs(now - logDate);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays <= 50;
		}).length;

		return {
			totalLogs: filteredLogs.length,
			recentLogs,
			totalAbsences,
			editableLogs,
		};
	}, [filteredLogs]);

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
		if (!window.confirm(t("common.confirmDelete"))) return;

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

			// Close details modal if the deleted log was being viewed
			if (selectedLogForDetails?.classLogId === logId) {
				setIsDetailsModalOpen(false);
				setSelectedLogForDetails(null);
			}
		} catch (error) {
			console.error("Error deleting class log:", error);
			alert("Failed to delete class log. Please try again.");
		}
	};

	// Toggle card expansion
	const toggleCardExpansion = (logId) => {
		setExpandedCards((prev) => ({
			...prev,
			[logId]: !prev[logId],
		}));
	};

	// New handler for showing log details
	const handleLogClick = (log) => {
		setSelectedLogForDetails(log);
		setIsDetailsModalOpen(true);
	};

	const closeModal = () => setIsModalOpen(false);

	// Close details modal
	const closeDetailsModal = () => {
		setIsDetailsModalOpen(false);
		setSelectedLogForDetails(null);
	};

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

		// Update selected log for details if it's currently being viewed
		if (selectedLogForDetails?.classLogId === updatedLog.classLogId) {
			setSelectedLogForDetails({ ...selectedLogForDetails, ...updatedLog });
		}
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
			return t("classLogs.allPresent");
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
			<div className="lco-page">
				<div className="lco-logged-classes-overview">
					<div className="lco-loading-container">
						<div className="lco-loading-spinner"></div>
						<p>{t("classLogs.loading")}</p>
					</div>
				</div>
			</div>
		);
	}

	// Render error state
	if (error) {
		return (
			<div className="lco-page">
				<div className="lco-logged-classes-overview">
					<div className="lco-error-container">
						<FontAwesomeIcon
							icon={faExclamationTriangle}
							className="lco-error-icon"
						/>
						<h3 className="lco-error-title">{t("classLogs.unableToLoad")}</h3>
						<p className="lco-error-message">{error}</p>
						<button
							className="lco-retry-button"
							onClick={() => window.location.reload()}
						>
							{t("classLogs.tryAgain")}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="lco-page">
			<div className="lco-logged-classes-overview">
				{/* Dashboard Header */}
				<div className="lco-dashboard-header">
					<div className="lco-header-left">
						<h2>
							<span className="lco-subject-name">
								{selectedSubjectName || "Loading..."}
							</span>
							<span className="lco-department-name">
								{departmentName || "Loading..."} {t("classLogs.class")}
							</span>
						</h2>
						<div className="lco-header-subtitle">
							{t("classLogs.managementDashboard")}
						</div>
					</div>

					{/* Stats moved to header */}
					<div className="lco-header-stats">
						<div className="lco-stat-card">
							<div className="lco-stat-icon">
								<FontAwesomeIcon icon={faClipboardList} />
							</div>
							<div className="lco-stat-content">
								<div className="lco-stat-value">{summaryStats.totalLogs}</div>
								<div className="lco-stat-label">{t("classLogs.totalLogs")}</div>
							</div>
						</div>

						<div className="lco-stat-card">
							<div className="lco-stat-icon">
								<FontAwesomeIcon icon={faCalendarAlt} />
							</div>
							<div className="lco-stat-content">
								<div className="lco-stat-value">{summaryStats.recentLogs}</div>
								<div className="lco-stat-label">
									{t("classLogs.last30Days")}
								</div>
							</div>
						</div>

						<div className="lco-stat-card">
							<div className="lco-stat-icon">
								<FontAwesomeIcon icon={faUserGraduate} />
							</div>
							<div className="lco-stat-content">
								<div className="lco-stat-value">
									{summaryStats.totalAbsences}
								</div>
								<div className="lco-stat-label">
									{t("classLogs.totalAbsences")}
								</div>
							</div>
						</div>

						<div className="lco-stat-card">
							<div className="lco-stat-icon">
								<FontAwesomeIcon icon={faEdit} />
							</div>
							<div className="lco-stat-content">
								<div className="lco-stat-value">
									{summaryStats.editableLogs}
								</div>
								<div className="lco-stat-label">
									{t("classLogs.editableLogs")}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Control Panel */}
				<div className="lco-control-panel">
					<div className="lco-control-group lco-subject-selector">
						<label htmlFor="subject-select">{t("classLogs.subject")}</label>
						<select
							id="subject-select"
							className="lco-subject-dropdown"
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
					</div>

					<div className="lco-control-group lco-view-selector">
						<label>{t("classLogs.viewMode")}</label>
						<div className="lco-view-buttons">
							<button
								className={`lco-view-button ${
									viewMode === "table" ? "active" : ""
								}`}
								onClick={() => setViewMode("table")}
								title={t("classLogs.tableView")}
							>
								<FontAwesomeIcon icon={faListOl} />
							</button>
							<button
								className={`lco-view-button ${
									viewMode === "card" ? "active" : ""
								}`}
								onClick={() => setViewMode("card")}
								title={t("classLogs.cardView")}
							>
								<FontAwesomeIcon icon={faClipboardList} />
							</button>
							{/* temporary disabled */}
							{/* <button
								className={`lco-view-button ${
									viewMode === "calendar" ? "active" : ""
								}`}
								onClick={() => setViewMode("calendar")}
								title={t("classLogs.calendarView")}
							>
								<FontAwesomeIcon icon={faCalendarAlt} />
							</button> */}
						</div>
					</div>

					<div className="lco-control-group lco-search-container">
						<label htmlFor="search-input">{t("classLogs.search")}</label>
						<div className="lco-search-input-wrapper">
							<FontAwesomeIcon icon={faSearch} className="lco-search-icon" />
							<input
								id="search-input"
								type="text"
								className="lco-search-input"
								placeholder={t("classLogs.searchPlaceholder")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							{searchQuery && (
								<button
									className="lco-clear-search"
									onClick={() => setSearchQuery("")}
									title={t("classLogs.clearSearch")}
								>
									<FontAwesomeIcon icon={faTimes} />
								</button>
							)}
						</div>
					</div>

					<div className="lco-control-group lco-button-container">
						<label>&nbsp;</label>
						<button className="lco-log-class-button" onClick={handleLogClass}>
							<FontAwesomeIcon icon={faPlus} /> {t("classLogForm.logClass")}
						</button>
					</div>
				</div>

				{/* Log Content */}
				<div className="lco-logs-content">
					{filteredLogs.length > 0 ? (
						<>
							{/* Table View */}
							{viewMode === "table" && (
								<div className="lco-logs-table-container">
									<table className="lco-logs-table">
										<thead>
											<tr>
												<th className="lco-date-header">
													{t("classLogs.date")}
												</th>
												<th>{t("classLogs.period")}</th>
												<th>{t("classLogs.lectureTitle")}</th>
												<th className="lco-sequence-header">
													{t("classLogs.sequence")}
												</th>
												<th className="lco-absent-header">
													{t("classLogs.absent")}
												</th>
												<th className="lco-actions-header">
													{t("classLogs.actions")}
												</th>
											</tr>
										</thead>
										<tbody>
											{currentLogs.map((log) => (
												<tr
													key={log.classLogId}
													onClick={() => handleLogClick(log)}
													className="lco-log-row"
												>
													<td className="lco-date-cell">
														<div className="lco-date-container">
															{formatDate(log.classDate)}
														</div>
													</td>
													<td className="lco-period-cell">{log.period}</td>
													<td className="lco-title-cell">
														<div>
															<span
																className="lco-lecture-title"
																title={log.lectureTitle}
															>
																{log.lectureTitle}
															</span>
														</div>
													</td>
													<td className="lco-sequence-cell">
														<div className="lco-sequence-container">
															{log.sequence}
														</div>
													</td>
													<td className="lco-absent-cell">
														<div
															className="lco-absent-badge"
															title={getAbsentTooltip(log.absentStudents)}
														>
															{log.absentStudents?.length || 0}
														</div>
													</td>
													<td
														className="lco-actions-cell"
														onClick={(e) => e.stopPropagation()}
													>
														<div className="lco-action-buttons">
															<button
																className="lco-edit-button"
																onClick={() => handleEditLog(log)}
																title={t("classLogs.editLog")}
																disabled={!isEditable(log)}
															>
																<FontAwesomeIcon icon={faEdit} />
															</button>
															<button
																className="lco-delete-button"
																onClick={() => handleDeleteLog(log.classLogId)}
																title={t("classLogs.deleteLog")}
															>
																<FontAwesomeIcon icon={faTrash} />
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}

							{/* Card View */}
							{viewMode === "card" && (
								<div className="lco-logs-card-container">
									{currentLogs.map((log) => (
										<div
											key={log.classLogId}
											className={`lco-log-card ${
												expandedCards[log.classLogId] ? "expanded" : ""
											}`}
										>
											<div
												className="lco-card-header"
												onClick={() => toggleCardExpansion(log.classLogId)}
											>
												<div className="lco-card-title-area">
													<div className="lco-card-sequence">
														{log.sequence}
													</div>
													<div className="lco-card-title-content">
														<h3 className="lco-card-title">
															{log.lectureTitle}
														</h3>
														<div className="lco-card-subtitle">
															<span className="lco-card-date">
																{formatDate(log.classDate)}
															</span>
															<span className="lco-card-period">
																{t("classLogs.period")} {log.period}
															</span>
														</div>
													</div>
												</div>
												<button className="lco-expand-toggle">
													<FontAwesomeIcon
														icon={
															expandedCards[log.classLogId]
																? faAngleUp
																: faAngleDown
														}
													/>
												</button>
											</div>

											<div className="lco-card-body">
												<div className="lco-card-info-group">
													<div className="lco-card-info-item">
														<span className="lco-info-label">
															{t("classLogs.attendance")}
														</span>
														<span className="lco-info-value lco-attendance-value">
															{log.absentStudents?.length ? (
																<span className="lco-absent-indicator">
																	<FontAwesomeIcon icon={faTimesCircle} />
																	{log.absentStudents.length}{" "}
																	{t("classLogs.absents")}
																</span>
															) : (
																<span className="lco-present-indicator">
																	<FontAwesomeIcon icon={faCheckCircle} />
																	{t("classLogs.allPresent")}
																</span>
															)}
														</span>
													</div>

													{log.absentStudents?.length > 0 && (
														<div className="lco-card-info-item lco-absent-list">
															<span className="lco-info-label">
																{t("classLogs.absentStudents")}
															</span>
															<span className="lco-info-value">
																{log.absentStudents
																	.map((s) => s.name)
																	.join(", ")}
															</span>
														</div>
													)}
												</div>

												<div className="lco-card-actions">
													<button
														className="lco-card-action lco-view-btn"
														onClick={() => handleLogClick(log)}
													>
														<FontAwesomeIcon icon={faInfoCircle} />{" "}
														{t("classLogs.view")}
													</button>

													<button
														className="lco-card-action lco-edit-btn"
														onClick={() => handleEditLog(log)}
														disabled={!isEditable(log)}
													>
														<FontAwesomeIcon icon={faEdit} />{" "}
														{t("classLogs.edit")}
													</button>

													<button
														className="lco-card-action lco-delete-btn"
														onClick={() => handleDeleteLog(log.classLogId)}
													>
														<FontAwesomeIcon icon={faTrash} />{" "}
														{t("classLogs.delete")}
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Calendar View */}
							{viewMode === "calendar" && (
								<div className="lco-calendar-view">
									<div className="lco-calendar-placeholder">
										<FontAwesomeIcon
											icon={faCalendarAlt}
											className="lco-calendar-icon"
										/>
										<p>{t("classLogs.calendarInDevelopment")}</p>
										<p>{t("classLogs.useOtherViews")}</p>
									</div>
								</div>
							)}

							{/* Pagination */}
							<div className="lco-pagination-container">
								<div className="lco-pagination-info">
									{t("classLogs.showing")} {indexOfFirstLog + 1}{" "}
									{t("classLogs.to")}{" "}
									{Math.min(indexOfLastLog, filteredLogs.length)}{" "}
									{t("classLogs.of")} {filteredLogs.length}{" "}
									{t("classLogs.entries")}
								</div>
								<div className="lco-pagination-controls">
									<button
										className="lco-page-button lco-prev-button"
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
													<span className="lco-page-ellipsis">...</span>
												)}
												<button
													className={`lco-page-button lco-number-button ${
														page === currentPage ? "active" : ""
													}`}
													onClick={() => handlePageChange(page)}
												>
													{page}
												</button>
											</React.Fragment>
										))}

									<button
										className="lco-page-button lco-next-button"
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}
									>
										<FontAwesomeIcon icon={faChevronRight} />
									</button>
								</div>
							</div>
						</>
					) : (
						<div className="lco-empty-state">
							<FontAwesomeIcon icon={faBookOpen} className="lco-empty-icon" />
							<h3 className="lco-empty-title">{t("classLogs.noLogsFound")}</h3>
							<p className="lco-empty-text">{t("classLogs.startTracking")}</p>
							{!searchQuery === "all" && (
								<button
									className="lco-log-class-button"
									onClick={handleLogClass}
								>
									<FontAwesomeIcon icon={faPlus} />{" "}
									{t("classLogs.logFirstClass")}
								</button>
							)}
							{searchQuery && (
								<button
									className="lco-clear-filters-button"
									onClick={() => {
										setSearchQuery("");
									}}
								>
									<FontAwesomeIcon icon={faTimes} />{" "}
									{t("classLogs.clearSearch")}
								</button>
							)}
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

				{/* Details Modal */}
				<LogDetailsModal
					log={selectedLogForDetails}
					isOpen={isDetailsModalOpen}
					onClose={closeDetailsModal}
					onEdit={handleEditLog}
					onDelete={handleDeleteLog}
					isEditable={
						selectedLogForDetails ? isEditable(selectedLogForDetails) : false
					}
					fromOverviewPage={true}
				/>
			</div>
		</div>
	);
};

export default LoggedClassesOverview;
