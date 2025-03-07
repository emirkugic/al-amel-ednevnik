import React, { useState, useEffect } from "react";
import "./TeacherManagement2.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSearch,
	faUserPlus,
	faEdit,
	faFilter,
	faTimes,
	faShieldAlt,
	faUser,
	faArrowDown,
	faArrowUp,
	faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import TeacherEditModal from "./TeacherEditModal"; // Import the modal component

// Mock data - replace with API calls in production
const MOCK_TEACHERS = [
	{
		id: 1,
		name: "Dr. Sarah Johnson",
		email: "sarah.johnson@school.edu",
		isAdmin: true,
		department: "Science",
		subjects: [
			{ id: 1, name: "Physics", classes: ["11A", "12B", "12C"] },
			{ id: 2, name: "Advanced Mathematics", classes: ["12A", "12B"] },
		],
	},
	{
		id: 2,
		name: "Prof. Michael Chen",
		email: "michael.chen@school.edu",
		isAdmin: false,
		department: "Mathematics",
		subjects: [
			{ id: 3, name: "Algebra", classes: ["9A", "9B", "10A"] },
			{ id: 4, name: "Calculus", classes: ["11B", "12A"] },
		],
	},
	{
		id: 3,
		name: "Dr. Emily Rodriguez",
		email: "emily.rodriguez@school.edu",
		isAdmin: true,
		department: "Languages",
		subjects: [
			{ id: 5, name: "English Literature", classes: ["11A", "11B", "12A"] },
			{ id: 6, name: "Creative Writing", classes: ["10A", "10B"] },
			{ id: 7, name: "Public Speaking", classes: ["9A", "9B", "9C"] },
		],
	},
	{
		id: 4,
		name: "Mr. David Wilson",
		email: "david.wilson@school.edu",
		isAdmin: false,
		department: "Social Sciences",
		subjects: [
			{ id: 8, name: "History", classes: ["9A", "9B", "10A", "10B"] },
			{ id: 9, name: "Geography", classes: ["9C", "10C"] },
		],
	},
	{
		id: 5,
		name: "Ms. Jessica Park",
		email: "jessica.park@school.edu",
		isAdmin: false,
		department: "Science",
		subjects: [
			{ id: 10, name: "Biology", classes: ["9A", "9B", "10A", "10B"] },
			{ id: 11, name: "Chemistry", classes: ["11A", "11B", "12A"] },
		],
	},
];

const TeacherManagement = () => {
	const [teachers, setTeachers] = useState([]);
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

	// Departments extracted from teacher data
	const departments = [
		...new Set(MOCK_TEACHERS.map((teacher) => teacher.department)),
	];

	// Fetch teachers (simulated API call)
	useEffect(() => {
		// Simulate API delay
		const timer = setTimeout(() => {
			setTeachers(MOCK_TEACHERS);
			setFilteredTeachers(MOCK_TEACHERS);
			setLoading(false);
		}, 800);
		return () => clearTimeout(timer);
	}, []);

	// Filter and sort teachers
	useEffect(() => {
		let result = [...teachers];

		// Apply search filter
		if (searchTerm) {
			result = result.filter(
				(teacher) =>
					teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
					teacher.subjects.some(
						(subject) =>
							subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
							subject.classes.some((cls) =>
								cls.toLowerCase().includes(searchTerm.toLowerCase())
							)
					)
			);
		}

		// Apply department filter
		if (filterDepartment) {
			result = result.filter(
				(teacher) => teacher.department === filterDepartment
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
		setSelectedTeacher(teacher);
		setIsModalOpen(true);
	};

	// Handle adding a new teacher
	const handleAddTeacher = () => {
		setSelectedTeacher(null); // No pre-selected teacher for "add new"
		setIsModalOpen(true);
	};

	// Handle saving teacher data
	const handleSaveTeacher = (teacherData) => {
		// For existing teachers
		if (teacherData.id) {
			setTeachers((prev) =>
				prev.map((teacher) =>
					teacher.id === teacherData.id ? { ...teacherData } : teacher
				)
			);
		}
		// For new teachers
		else {
			const newTeacher = {
				...teacherData,
				id: Math.max(...teachers.map((t) => t.id)) + 1, // Generate new ID
			};
			setTeachers((prev) => [...prev, newTeacher]);
		}

		setIsModalOpen(false);
	};

	if (loading) {
		return (
			<div className="dashboard-card loading-card">
				<div className="loading-spinner"></div>
				<p>Loading teacher data...</p>
			</div>
		);
	}

	return (
		<div className="dashboard-card">
			<div className="teacher-header">
				<div className="teacher-title">
					<h1>Teacher Management</h1>
					<p>
						<span className="stat-pill">
							<FontAwesomeIcon icon={faUser} /> {teachers.length} teachers
						</span>
						<span className="stat-pill admin">
							<FontAwesomeIcon icon={faShieldAlt} />{" "}
							{teachers.filter((t) => t.isAdmin).length} admins
						</span>
					</p>
				</div>
				<button className="add-teacher-btn" onClick={handleAddTeacher}>
					<FontAwesomeIcon icon={faUserPlus} /> Add New Teacher
				</button>
			</div>

			{showFilters && (
				<div className="advanced-filters">
					<div className="filter-group">
						<label>Department</label>
						<select
							value={filterDepartment}
							onChange={(e) => setFilterDepartment(e.target.value)}
						>
							<option value="">All Departments</option>
							{departments.map((dept) => (
								<option key={dept} value={dept}>
									{dept}
								</option>
							))}
						</select>
					</div>

					<div className="filter-group">
						<label>Role</label>
						<select
							value={filterAdmin}
							onChange={(e) => setFilterAdmin(e.target.value)}
						>
							<option value="all">All Roles</option>
							<option value="admin">Administrators</option>
							<option value="teacher">Teachers Only</option>
						</select>
					</div>

					<div className="filter-group">
						<label>Sort By</label>
						<div className="sort-options">
							<button
								className={`sort-btn ${sortBy === "name" ? "active" : ""}`}
								onClick={() => handleSort("name")}
							>
								Name
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
								Subjects
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
								Classes
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
								<th>Teacher</th>
								<th>Email</th>
								<th>Subjects</th>
								<th>Classes</th>
								<th>Role</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredTeachers.map((teacher, index) => (
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
													<FontAwesomeIcon icon={faShieldAlt} /> Admin
												</span>
											) : (
												<span className="teacher-badge">
													<FontAwesomeIcon icon={faUser} /> Teacher
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
																<th>Subject</th>
																<th>Classes</th>
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
					<p>No teachers match your search criteria.</p>
					<button onClick={clearFilters}>
						<FontAwesomeIcon icon={faTimes} /> Clear Filters
					</button>
				</div>
			)}

			{/* Teacher Edit Modal */}
			<TeacherEditModal
				isOpen={isModalOpen}
				teacher={selectedTeacher}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveTeacher}
			/>
		</div>
	);
};

export default TeacherManagement;
