import React, { useState, useEffect } from "react";
import "./SubjectManagement.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBook,
	faPlus,
	faEdit,
	faTrash,
	faSearch,
	faGraduationCap,
	faFilter,
	faSort,
	faTimes,
	faArrowDown,
	faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import AddEditSubjectModal from "../AddEditSubjectModal/AddEditSubjectModal";
import subjectApi from "../../../../api/subjectApi";
import useAuth from "../../../../hooks/useAuth";
import { useLanguage } from "../../../../contexts";

const SubjectManagement = () => {
	const { user } = useAuth();
	const { t } = useLanguage();
	const [subjects, setSubjects] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalData, setModalData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [gradeFilter, setGradeFilter] = useState("");
	const [sortBy, setSortBy] = useState("name");
	const [sortDirection, setSortDirection] = useState("asc");
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		if (!user?.token) return;

		const fetchSubjects = async () => {
			setIsLoading(true);
			try {
				const data = await subjectApi.getAllSubjects(user.token);
				setSubjects(data);
			} catch (error) {
				console.error("Error fetching subjects:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchSubjects();
	}, [user]);

	// Get all unique grade levels
	const allGrades = [
		...new Set(subjects.flatMap((subject) => subject.gradeLevels)),
	].sort((a, b) => a - b);

	// Filter and sort subjects
	const filteredSubjects = subjects
		.filter((subject) => {
			// Apply search filter
			const matchesSearch = subject.name
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

			// Apply grade filter
			const matchesGrade =
				!gradeFilter || subject.gradeLevels.includes(gradeFilter);

			return matchesSearch && matchesGrade;
		})
		.sort((a, b) => {
			// Apply sorting
			let compareValue = 0;

			switch (sortBy) {
				case "name":
					compareValue = a.name.localeCompare(b.name);
					break;
				case "gradeCount":
					compareValue = a.gradeLevels.length - b.gradeLevels.length;
					break;
				default:
					compareValue = 0;
			}

			return sortDirection === "asc" ? compareValue : -compareValue;
		});

	const openAddModal = () => {
		setModalData(null);
		setIsModalOpen(true);
	};

	const openEditModal = (subject, e) => {
		e.stopPropagation();
		setModalData(subject);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setModalData(null);
	};

	const handleSave = async (subjectData) => {
		try {
			if (modalData) {
				// Update subject
				await subjectApi.updateSubject(modalData.id, subjectData, user.token);
				setSubjects((prev) =>
					prev.map((sub) =>
						sub.id === modalData.id ? { ...sub, ...subjectData } : sub
					)
				);
			} else {
				// Create subject
				const newSubject = await subjectApi.createSubject(
					subjectData,
					user.token
				);
				setSubjects((prev) => [...prev, newSubject]);
			}
		} catch (error) {
			console.error("Error saving subject:", error);
		} finally {
			closeModal();
		}
	};

	const handleDelete = async (id, e) => {
		e.stopPropagation();
		if (window.confirm(t("subjects.deleteConfirm"))) {
			try {
				await subjectApi.deleteSubject(id, user.token);
				setSubjects((prev) => prev.filter((subject) => subject.id !== id));
			} catch (error) {
				console.error("Error deleting subject:", error);
			}
		}
	};

	// Toggle sort direction
	const handleSort = (column) => {
		if (sortBy === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortDirection("asc");
		}
	};

	// Clear all filters
	const clearFilters = () => {
		setSearchTerm("");
		setGradeFilter("");
	};

	if (!user?.token) {
		return (
			<div className="subject-dashboard-card subject-loading-card">
				<div className="subject-loading-spinner"></div>
				<p>{t("common.loading")}</p>
			</div>
		);
	}

	return (
		<div className="subject-dashboard-card">
			{/* Header */}
			<div className="subject-header">
				<div className="subject-title">
					<h1>{t("subjects.pageTitle")}</h1>
					<p>
						<span className="subject-stat-pill">
							<FontAwesomeIcon icon={faBook} /> {subjects.length}{" "}
							{t("subjects.subjectsCount")}
						</span>
					</p>
				</div>
				<button className="subject-add-btn" onClick={openAddModal}>
					<FontAwesomeIcon icon={faPlus} /> {t("subjects.addNewSubject")}
				</button>
			</div>

			{/* Table View */}
			{isLoading ? (
				<div className="subject-loading-container">
					<div className="subject-loading-spinner"></div>
					<p>{t("subjects.loading")}</p>
				</div>
			) : filteredSubjects.length > 0 ? (
				<div className="subject-table-container">
					<table className="subject-table">
						<thead>
							<tr>
								<th>{t("subjects.subject")}</th>
								<th>{t("subjects.gradeLevels")}</th>
								<th className="subject-count-col">
									{t("subjects.gradeCount")}
								</th>
								<th className="subject-actions-col">{t("subjects.actions")}</th>
							</tr>
						</thead>
						<tbody>
							{filteredSubjects.map((subject) => (
								<tr key={subject.id} className="subject-row">
									<td className="subject-name-cell">
										<div className="subject-cell-content">
											<FontAwesomeIcon
												icon={faBook}
												className="subject-row-icon"
											/>
											<span className="subject-row-name">{subject.name}</span>
										</div>
									</td>
									<td>
										<div className="subject-grade-chips">
											{subject.gradeLevels.length > 0 ? (
												subject.gradeLevels.map((grade) => (
													<span key={grade} className="subject-grade-chip">
														{grade}
													</span>
												))
											) : (
												<span className="subject-no-grades-text">
													{t("subjects.noGradesAssigned")}
												</span>
											)}
										</div>
									</td>
									<td className="subject-count-col">
										<span className="subject-count-badge">
											{subject.gradeLevels.length}
										</span>
									</td>
									<td className="subject-actions-col">
										<div className="subject-action-buttons">
											<button
												className="subject-edit-btn"
												onClick={(e) => openEditModal(subject, e)}
												aria-label={t("subjects.editSubject")}
											>
												<FontAwesomeIcon icon={faEdit} />
											</button>
											<button
												className="subject-delete-btn"
												onClick={(e) => handleDelete(subject.id, e)}
												aria-label={t("subjects.deleteSubject")}
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
			) : (
				<div className="subject-no-results">
					<FontAwesomeIcon icon={faBook} className="subject-no-results-icon" />
					<p>{t("subjects.noSubjectsFound")}</p>
					<button onClick={clearFilters}>
						<FontAwesomeIcon icon={faTimes} /> {t("subjects.clearFilters")}
					</button>
				</div>
			)}

			{/* Modal */}
			{isModalOpen && (
				<AddEditSubjectModal
					isOpen={isModalOpen}
					onClose={closeModal}
					onSave={handleSave}
					initialData={modalData}
				/>
			)}
		</div>
	);
};

export default SubjectManagement;
