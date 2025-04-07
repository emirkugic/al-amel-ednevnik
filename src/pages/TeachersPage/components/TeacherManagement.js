import React, { useState, useEffect } from "react";
import "./TeacherManagement2.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUserPlus,
	faEdit,
	faTimes,
	faShieldAlt,
	faUser,
	faArrowDown,
	faArrowUp,
	faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import TeacherEditModal from "./TeacherEditModal";

import useAuth from "../../../hooks/useAuth";
import teacherApi from "../../../api/teacherApi";
import subjectApi from "../../../api/subjectApi";
import departmentApi from "../../../api/departmentApi";
import { useLanguage } from "../../../contexts/LanguageContext";

const TeacherManagement = () => {
	const { user } = useAuth();
	const { t } = useLanguage();
	const token = user?.token;

	// State management
	const [teachers, setTeachers] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [filteredTeachers, setFilteredTeachers] = useState([]);

	const [searchTerm, setSearchTerm] = useState("");
	const [filterDepartment, setFilterDepartment] = useState("");
	const [filterAdmin, setFilterAdmin] = useState("all");
	const [sortBy, setSortBy] = useState("name");
	const [sortDirection, setSortDirection] = useState("asc");
	const [expandedTeacher, setExpandedTeacher] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showFilters, setShowFilters] = useState(false);

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTeacher, setSelectedTeacher] = useState(null);

	// Fetch data from backend APIs
	useEffect(() => {
		if (!token) return;

		const fetchData = async () => {
			try {
				setLoading(true);

				// Fetch all required data in parallel
				const [teacherData, subjectData, departmentData] = await Promise.all([
					teacherApi.getAllTeachers(token),
					subjectApi.getAllSubjects(token),
					departmentApi.getAllDepartments(token),
				]);

				setTeachers(teacherData);
				setSubjects(subjectData);
				setDepartments(departmentData);

				// Initial filtering/sorting happens in the other useEffect
				setLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
				setLoading(false);
			}
		};

		fetchData();
	}, [token]);

	const uniqueDepartments = () => {
		const departmentIds = new Set();

		teachers.forEach((teacher) => {
			if (teacher.assignedSubjects) {
				teacher.assignedSubjects.forEach((assignment) => {
					assignment.departmentId.forEach((depId) => {
						departmentIds.add(depId);
					});
				});
			}
		});

		// Map these IDs to department names
		return Array.from(departmentIds)
			.map((id) => departments.find((dep) => dep.id === id))
			.filter(Boolean);
	};

	const transformTeacherData = (teacher) => {
		const transformedSubjects = [];

		if (teacher.assignedSubjects) {
			teacher.assignedSubjects.forEach((assignment) => {
				const subject = subjects.find((s) => s.id === assignment.subjectId);

				if (subject) {
					const classes = assignment.departmentId.map((depId) => {
						const department = departments.find((d) => d.id === depId);
						return department ? department.departmentName : depId;
					});

					transformedSubjects.push({
						id: subject.id,
						name: subject.name,
						classes: classes,
					});
				}
			});
		}

		return {
			id: teacher.id,
			name: `${teacher.firstName} ${teacher.lastName}`,
			email: teacher.email,
			firstName: teacher.firstName,
			lastName: teacher.lastName,
			loginPassword: teacher.loginPassword,
			gradePassword: teacher.gradePassword || "",
			isAdmin: teacher.isAdmin || false,
			subjects: transformedSubjects,
		};
	};

	useEffect(() => {
		if (teachers.length === 0) return;

		let result = [...teachers].map(transformTeacherData);

		if (searchTerm) {
			result = result.filter((teacher) => {
				const fullName = `${teacher.name}`.toLowerCase();
				const email = teacher.email.toLowerCase();
				const searchLower = searchTerm.toLowerCase();

				const nameOrEmailMatch =
					fullName.includes(searchLower) || email.includes(searchLower);

				const subjectMatch = teacher.subjects.some(
					(subject) =>
						subject.name.toLowerCase().includes(searchLower) ||
						subject.classes.some((cls) =>
							cls.toLowerCase().includes(searchLower)
						)
				);

				return nameOrEmailMatch || subjectMatch;
			});
		}

		// Apply department filter
		if (filterDepartment) {
			result = result.filter((teacher) =>
				teacher.subjects.some((subject) =>
					subject.classes.includes(filterDepartment)
				)
			);
		}

		// Apply admin filter
		if (filterAdmin !== "all") {
			result = result.filter((teacher) =>
				filterAdmin === "admin" ? teacher.isAdmin : !teacher.isAdmin
			);
		}

		// Apply sorting
		result.sort((a, b) => {
			let compareValue = 0;

			switch (sortBy) {
				case "name":
					compareValue = a.name.localeCompare(b.name);
					break;
				case "subjectCount":
					compareValue = a.subjects.length - b.subjects.length;
					break;
				case "classCount":
					compareValue = countTotalClasses(a) - countTotalClasses(b);
					break;
				default:
					compareValue = 0;
			}

			return sortDirection === "asc" ? compareValue : -compareValue;
		});

		setFilteredTeachers(result);
	}, [
		teachers,
		subjects,
		departments,
		searchTerm,
		filterDepartment,
		filterAdmin,
		sortBy,
		sortDirection,
	]);

	// Count total classes for a teacher
	const countTotalClasses = (teacher) => {
		return teacher.subjects.reduce(
			(total, subject) => total + subject.classes.length,
			0
		);
	};

	// Toggle expanded view for a teacher
	const toggleExpand = (teacherId) => {
		setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId);
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
		setFilterDepartment("");
		setFilterAdmin("all");
	};

	// Open the edit modal for a teacher
	const openEditModal = (teacher, e) => {
		e.stopPropagation(); // Prevent row click from toggling expand

		// Find the original teacher data to pass to the modal
		const originalTeacher = teachers.find((t) => t.id === teacher.id);
		if (originalTeacher) {
			setSelectedTeacher(originalTeacher);
			setIsModalOpen(true);
		}
	};

	// Handle adding a new teacher
	const handleAddTeacher = () => {
		setSelectedTeacher(null); // No pre-selected teacher for "add new"
		setIsModalOpen(true);
	};

	// Handle saving teacher data
	const handleSaveTeacher = async (teacherData) => {
		try {
			// Handle delete case (when _delete flag is set)
			if (teacherData._delete && teacherData.id) {
				// Delete the teacher
				await teacherApi.deleteTeacher(teacherData.id, token);

				// Update the state by removing the deleted teacher
				setTeachers((prevTeachers) =>
					prevTeachers.filter((t) => t.id !== teacherData.id)
				);

				// Close the modal
				setIsModalOpen(false);
				return;
			}

			// Format teacher data for the API - only include provided data
			const apiTeacherData = {
				firstName: teacherData.firstName,
				lastName: teacherData.lastName,
				email: teacherData.email,
				isAdmin: teacherData.isAdmin,
				// Initialize AssignedSubjects as an empty array for new teachers
				// to prevent null issues when adding subjects later
				assignedSubjects: teacherData.id ? undefined : [],
			};

			// Only include passwords if they're provided
			if (teacherData.loginPassword) {
				apiTeacherData.loginPassword = teacherData.loginPassword;
			}

			if (teacherData.gradePassword) {
				apiTeacherData.gradePassword = teacherData.gradePassword;
			}

			let updatedTeacher;

			// Update existing teacher
			if (teacherData.id) {
				updatedTeacher = await teacherApi.updateTeacher(
					teacherData.id,
					apiTeacherData,
					token
				);

				// Update teacher subjects if needed
				if (teacherData.subjectUpdates) {
					// Handle subject additions
					for (const subjectToAdd of teacherData.subjectUpdates.add || []) {
						await teacherApi.addSubjectToTeacher(
							teacherData.id,
							subjectToAdd,
							token
						);
					}

					// Handle subject removals
					for (const subjectIdToRemove of teacherData.subjectUpdates.remove ||
						[]) {
						await teacherApi.removeSubjectFromTeacher(
							teacherData.id,
							subjectIdToRemove,
							token
						);
					}

					// Refresh teacher data after updating subjects
					updatedTeacher = await teacherApi.getTeacherById(
						teacherData.id,
						token
					);
				}

				// Update the teacher in the state
				setTeachers((prevTeachers) =>
					prevTeachers.map((t) =>
						t.id === updatedTeacher.id ? updatedTeacher : t
					)
				);
			}
			// Create new teacher
			else {
				// For new teachers, password is required
				if (!apiTeacherData.loginPassword) {
					throw new Error("Login password is required for new teachers");
				}

				const createdTeacher = await teacherApi.createTeacher(
					apiTeacherData,
					token
				);
				setTeachers((prevTeachers) => [...prevTeachers, createdTeacher]);
			}

			setIsModalOpen(false);
		} catch (error) {
			console.error("Error saving teacher:", error);
			alert(
				`Error: ${error.message || "Failed to save teacher. Please try again."}`
			);
		}
	};

	if (loading) {
		return (
			<div className="dashboard-card loading-card">
				<div className="loading-spinner"></div>
				<p>{t("teacherManagement.loadingTeachers")}</p>
			</div>
		);
	}

	return (
		<div className="dashboard-card">
			<div className="teacher-header">
				<div className="teacher-title">
					<h1>{t("teacherManagement.title")}</h1>
					<p>
						<span className="stat-pill">
							<FontAwesomeIcon icon={faUser} /> {teachers.length}{" "}
							{t("teacherManagement.teachers")}
						</span>
						<span className="stat-pill admin">
							<FontAwesomeIcon icon={faShieldAlt} />{" "}
							{teachers.filter((t) => t.isAdmin).length}{" "}
							{t("teacherManagement.admins")}
						</span>
					</p>
				</div>
				<button className="add-teacher-btn" onClick={handleAddTeacher}>
					<FontAwesomeIcon icon={faUserPlus} />{" "}
					{t("teacherManagement.addNewTeacher")}
				</button>
			</div>

			{showFilters && (
				<div className="advanced-filters">
					<div className="filter-group">
						<label>{t("teacherManagement.department")}</label>
						<select
							value={filterDepartment}
							onChange={(e) => setFilterDepartment(e.target.value)}
						>
							<option value="">{t("teacherManagement.allDepartments")}</option>
							{uniqueDepartments().map((dept) => (
								<option key={dept.id} value={dept.departmentName}>
									{dept.departmentName}
								</option>
							))}
						</select>
					</div>

					<div className="filter-group">
						<label>{t("teacherManagement.role")}</label>
						<select
							value={filterAdmin}
							onChange={(e) => setFilterAdmin(e.target.value)}
						>
							<option value="all">{t("teacherManagement.allRoles")}</option>
							<option value="admin">
								{t("teacherManagement.administrators")}
							</option>
							<option value="teacher">
								{t("teacherManagement.teachersOnly")}
							</option>
						</select>
					</div>

					<div className="filter-group">
						<label>{t("teacherManagement.sortBy")}</label>
						<div className="sort-options">
							<button
								className={`sort-btn ${sortBy === "name" ? "active" : ""}`}
								onClick={() => handleSort("name")}
							>
								{t("teacherManagement.name")}
								{sortBy === "name" && (
									<FontAwesomeIcon
										icon={sortDirection === "asc" ? faArrowUp : faArrowDown}
									/>
								)}
							</button>
							<button
								className={`sort-btn ${
									sortBy === "subjectCount" ? "active" : ""
								}`}
								onClick={() => handleSort("subjectCount")}
							>
								{t("teacherManagement.subjects")}
								{sortBy === "subjectCount" && (
									<FontAwesomeIcon
										icon={sortDirection === "asc" ? faArrowUp : faArrowDown}
									/>
								)}
							</button>
							<button
								className={`sort-btn ${
									sortBy === "classCount" ? "active" : ""
								}`}
								onClick={() => handleSort("classCount")}
							>
								{t("teacherManagement.classes")}
								{sortBy === "classCount" && (
									<FontAwesomeIcon
										icon={sortDirection === "asc" ? faArrowUp : faArrowDown}
									/>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{filteredTeachers.length > 0 ? (
				<div className="table-container">
					<table className="teacher-table">
						<thead>
							<tr>
								<th>{t("teacherManagement.teacher")}</th>
								<th>{t("teacherManagement.email")}</th>
								<th>{t("teacherManagement.subjects")}</th>
								<th>{t("teacherManagement.classes")}</th>
								<th>{t("teacherManagement.role")}</th>
								<th>{t("teacherManagement.actions")}</th>
							</tr>
						</thead>
						<tbody>
							{filteredTeachers.map((teacher) => (
								<React.Fragment key={teacher.id}>
									<tr
										className={expandedTeacher === teacher.id ? "expanded" : ""}
										onClick={() => toggleExpand(teacher.id)}
									>
										<td className="teacher-name-cell">
											<div className="teacher-name">{teacher.name}</div>
										</td>
										<td>
											<div className="contact-info">
												<div className="email-display">
													<FontAwesomeIcon
														icon={faEnvelope}
														className="contact-icon"
													/>
													{teacher.email}
												</div>
											</div>
										</td>
										<td className="count-cell">{teacher.subjects.length}</td>
										<td className="count-cell">{countTotalClasses(teacher)}</td>
										<td>
											{teacher.isAdmin ? (
												<span className="admin-badge">
													<FontAwesomeIcon icon={faShieldAlt} />{" "}
													{t("teacherModal.admin")}
												</span>
											) : (
												<span className="teacher-badge">
													<FontAwesomeIcon icon={faUser} />{" "}
													{t("teacherModal.teacher")}
												</span>
											)}
										</td>
										<td>
											<div className="action-buttons">
												<button
													className="edit-btn"
													aria-label="Edit Teacher"
													title="Edit Teacher"
													onClick={(e) => openEditModal(teacher, e)}
												>
													<FontAwesomeIcon icon={faEdit} />
												</button>
											</div>
										</td>
									</tr>
									{expandedTeacher === teacher.id && (
										<tr className="details-row">
											<td colSpan="6">
												<div className="teacher-details">
													<table className="subjects-table">
														<thead>
															<tr>
																<th>{t("subjects.subject")}</th>
																<th>{t("teacherManagement.classes")}</th>
															</tr>
														</thead>
														<tbody>
															{teacher.subjects.map((subject) => (
																<tr key={subject.id}>
																	<td>{subject.name}</td>
																	<td>
																		<div className="class-chips">
																			{subject.classes.map((cls) => (
																				<span className="class-chip" key={cls}>
																					{cls}
																				</span>
																			))}
																		</div>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</td>
										</tr>
									)}
								</React.Fragment>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className="no-results">
					<p>{t("teacherManagement.noTeachersMatch")}</p>
					<button onClick={clearFilters}>
						<FontAwesomeIcon icon={faTimes} />{" "}
						{t("teacherManagement.clearFilters")}
					</button>
				</div>
			)}

			{/* Teacher Edit Modal */}
			<TeacherEditModal
				isOpen={isModalOpen}
				teacher={selectedTeacher}
				subjects={subjects}
				departments={departments}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveTeacher}
			/>
		</div>
	);
};

export default TeacherManagement;
