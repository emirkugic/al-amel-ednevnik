import React, { useState, useEffect } from "react";
import "./TeacherManagement2.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSearch,
	faUserPlus,
	faEdit,
	faChevronDown,
	faChevronUp,
	faBook,
	faChalkboardTeacher,
	faEnvelope,
	faPhone,
	faFilter,
	faSort,
	faTimes,
	faShieldAlt,
	faUser,
	faArrowDown,
	faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

// Mock data - replace with API calls in production
const MOCK_TEACHERS = [
	{
		id: 1,
		name: "Dr. Sarah Johnson",
		email: "sarah.johnson@school.edu",
		phone: "(555) 123-4567",
		isAdmin: true,
		department: "Science",
		subjects: [
			{ id: 1, name: "Physics", classes: ["11A", "12B", "12C"] },
			{ id: 2, name: "Advanced Mathematics", classes: ["12A", "12B"] },
		],
	},
	{
		id: 2,
		name: "Hossameldin Ibrahim Sayed Yassin Sayed Ahmed",
		email: "michael.chen@school.edu",
		phone: "(555) 234-5678",
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
		phone: "(555) 345-6789",
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
		phone: "(555) 456-7890",
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
		phone: "(555) 567-8901",
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

	if (loading) {
		return (
			<div className="teacher-loading">
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
				<button className="add-teacher-btn">
					<FontAwesomeIcon icon={faUserPlus} /> Add New Teacher
				</button>
			</div>

			{/* temporary disabled, don't delete  */}
			{/* <div className="search-filter-container">
				<div className="search-bar">
					<FontAwesomeIcon icon={faSearch} className="search-icon" />
					<input
						type="text"
						placeholder="Search by name, subject, or class..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					{searchTerm && (
						<button className="clear-search" onClick={() => setSearchTerm("")}>
							<FontAwesomeIcon icon={faTimes} />
						</button>
					)}
				</div>

				<div className="filter-actions">
					<button
						className={`filter-toggle ${showFilters ? "active" : ""}`}
						onClick={() => setShowFilters(!showFilters)}
					>
						<FontAwesomeIcon icon={faFilter} /> Filters
					</button>

					{(searchTerm || filterDepartment || filterAdmin !== "all") && (
						<button className="clear-filters" onClick={clearFilters}>
							<FontAwesomeIcon icon={faTimes} /> Clear
						</button>
					)}
				</div>
			</div> */}

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
								<th>Contact Information</th>
								<th>Subjects</th>
								<th>Classes</th>
								<th>Role</th>
								<th>Actions</th>
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
												<div>{teacher.email}</div>
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
												<FontAwesomeIcon
													className="expand-icon"
													icon={
														expandedTeacher === teacher.id
															? faChevronUp
															: faChevronDown
													}
												/>
												<button
													className="edit-btn"
													aria-label="Edit Teacher"
													title="Edit Teacher"
													onClick={(e) => {
														e.stopPropagation(); // Prevent row click from triggering
													}}
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
																	<td>
																		<FontAwesomeIcon
																			icon={faBook}
																			className="subject-icon"
																		/>
																		{subject.name}
																	</td>
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
		</div>
	);
};

export default TeacherManagement;
