import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPlus,
	faEdit,
	faTrashAlt,
	faCalendarAlt,
	faTimes,
	faCheck,
	faExclamationTriangle,
	faFilter,
	faSearch,
	faSort,
	faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./Assessments.css";

const Assessments = () => {
	// Assessment types
	const assessmentTypes = [
		"Exam",
		"Quiz",
		"Homework",
		"Project",
		"Presentation",
		"Participation",
		"Lab",
		"Essay",
	];

	// State for assessments
	const [assessments, setAssessments] = useState([]);
	const [loading, setLoading] = useState(true);

	// State for search and filters
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("All");
	const [sortOrder, setSortOrder] = useState("newest"); // "newest", "oldest", "highest", "lowest"

	// State for new assessment form
	const [showForm, setShowForm] = useState(false);
	const [newAssessment, setNewAssessment] = useState({
		title: "",
		type: "Exam",
		points: "",
		date: new Date().toISOString().split("T")[0],
	});

	// State for edited assessment
	const [editingId, setEditingId] = useState(null);

	// State for tooltip
	const [showTooltip, setShowTooltip] = useState(false);

	// Load assessments (simulated API call)
	useEffect(() => {
		const fetchAssessments = async () => {
			setLoading(true);
			// In a real app, fetch from API
			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 800));

				// Mock data
				const mockAssessments = [
					{
						id: 1,
						title: "Midterm Exam",
						type: "Exam",
						points: 25,
						date: "2025-03-15",
					},
					{
						id: 2,
						title: "Weekly Quiz #1",
						type: "Quiz",
						points: 10,
						date: "2025-03-05",
					},
					{
						id: 3,
						title: "Research Paper",
						type: "Project",
						points: 20,
						date: "2025-03-25",
					},
					{
						id: 4,
						title: "Chapter 5 Problems",
						type: "Homework",
						points: 5,
						date: "2025-02-20",
					},
					{
						id: 5,
						title: "Lab Report",
						type: "Lab",
						points: 15,
						date: "2025-02-10",
					},
					{
						id: 6,
						title: "Final Exam",
						type: "Exam",
						points: 25,
						date: "2025-04-28",
					},
				];
				setAssessments(mockAssessments);
			} catch (error) {
				console.error("Error fetching assessments:", error);
				// Handle error state
			} finally {
				setLoading(false);
			}
		};

		fetchAssessments();
	}, []);

	// Calculate total points
	const totalPoints = assessments.reduce((sum, item) => sum + item.points, 0);
	const isOverLimit = totalPoints > 100;
	const remainingPoints = 100 - totalPoints;

	// Filter and sort assessments
	const getFilteredAndSortedAssessments = () => {
		let filtered = [...assessments];

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter((a) =>
				a.title.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Apply type filter
		if (filterType !== "All") {
			filtered = filtered.filter((a) => a.type === filterType);
		}

		// Apply sorting
		switch (sortOrder) {
			case "newest":
				filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
				break;
			case "oldest":
				filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
				break;
			case "highest":
				filtered.sort((a, b) => b.points - a.points);
				break;
			case "lowest":
				filtered.sort((a, b) => a.points - b.points);
				break;
			default:
				filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
		}

		return filtered;
	};

	// Handle input changes for new assessment
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		if (name === "points") {
			// Only allow positive numbers up to 100
			const points = Math.min(Math.max(0, parseInt(value) || 0), 100);
			setNewAssessment({ ...newAssessment, [name]: points });
		} else {
			setNewAssessment({ ...newAssessment, [name]: value });
		}
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!newAssessment.title.trim() || !newAssessment.points) return;

		if (editingId) {
			// Update existing assessment
			setAssessments(
				assessments.map((item) =>
					item.id === editingId ? { ...item, ...newAssessment } : item
				)
			);
			setEditingId(null);
		} else {
			// Add new assessment
			const newItem = {
				...newAssessment,
				id: Date.now(),
				points: parseInt(newAssessment.points),
			};
			setAssessments([...assessments, newItem]);
		}

		// Reset form
		setNewAssessment({
			title: "",
			type: "Exam",
			points: "",
			date: new Date().toISOString().split("T")[0],
		});
		setShowForm(false);
	};

	// Handle edit button click
	const handleEdit = (assessment) => {
		setNewAssessment({ ...assessment });
		setEditingId(assessment.id);
		setShowForm(true);
	};

	// Handle delete button click
	const handleDelete = (id) => {
		if (window.confirm("Are you sure you want to delete this assessment?")) {
			setAssessments(assessments.filter((item) => item.id !== id));
		}
	};

	// Function to cancel editing/adding
	const handleCancel = () => {
		setShowForm(false);
		setEditingId(null);
		setNewAssessment({
			title: "",
			type: "Exam",
			points: "",
			date: new Date().toISOString().split("T")[0],
		});
	};

	// Group assessments by month
	const groupByMonth = (assessmentsArray) => {
		return assessmentsArray.reduce((groups, assessment) => {
			const date = new Date(assessment.date);
			const monthYear = date.toLocaleString("default", {
				month: "long",
				year: "numeric",
			});

			if (!groups[monthYear]) {
				groups[monthYear] = [];
			}

			groups[monthYear].push(assessment);
			return groups;
		}, {});
	};

	// Get filtered and sorted assessments
	const filteredAndSortedAssessments = getFilteredAndSortedAssessments();

	// Group them by month
	const groupedAssessments = groupByMonth(filteredAndSortedAssessments);

	// Sort months chronologically
	const sortedMonths = Object.keys(groupedAssessments).sort((a, b) => {
		const dateA = new Date(a);
		const dateB = new Date(b);
		return dateA - dateB;
	});

	return (
		<div className="assessments-dashboard">
			<div className="assessments-header">
				<div className="title-section">
					<h1>Assessments</h1>
					<div className="points-meter">
						<div className="meter-tooltip-container">
							<div className="points-info">
								<div className="meter-label">
									<span>
										Total: <strong>{totalPoints}/100 points</strong>
									</span>
									<FontAwesomeIcon
										icon={faInfoCircle}
										className="info-icon"
										onMouseEnter={() => setShowTooltip(true)}
										onMouseLeave={() => setShowTooltip(false)}
									/>
								</div>
								{showTooltip && (
									<div className="points-tooltip">
										The total sum of all points for all assessments should not
										exceed 100 points.
									</div>
								)}
							</div>
							<div className="meter-container">
								<div className="progress-bar-container">
									<div
										className={`progress-bar ${
											isOverLimit ? "over-limit" : ""
										}`}
										style={{ width: `${Math.min(totalPoints, 100)}%` }}
									></div>
								</div>
								<div className="meter-stats">
									{isOverLimit ? (
										<span className="over-limit-message">
											<FontAwesomeIcon icon={faExclamationTriangle} />
											Exceeds limit by {totalPoints - 100} points
										</span>
									) : (
										<span className="remaining-points">
											{remainingPoints} points remaining
										</span>
									)}
								</div>
							</div>
						</div>
						<button
							className="btn-add"
							onClick={() => setShowForm(true)}
							disabled={showForm}
						>
							<FontAwesomeIcon icon={faPlus} />
							New Assessment
						</button>
					</div>
				</div>

				<div className="filter-section">
					<div className="search-bar">
						<FontAwesomeIcon icon={faSearch} className="search-icon" />
						<input
							type="text"
							placeholder="Search assessments..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						{searchTerm && (
							<button
								className="clear-search"
								onClick={() => setSearchTerm("")}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						)}
					</div>

					<div className="filters">
						<div className="filter-dropdown">
							<FontAwesomeIcon icon={faFilter} className="filter-icon" />
							<select
								value={filterType}
								onChange={(e) => setFilterType(e.target.value)}
							>
								<option value="All">All Types</option>
								{assessmentTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>

						<div className="sort-dropdown">
							<FontAwesomeIcon icon={faSort} className="sort-icon" />
							<select
								value={sortOrder}
								onChange={(e) => setSortOrder(e.target.value)}
							>
								<option value="newest">Newest First</option>
								<option value="oldest">Oldest First</option>
								<option value="highest">Highest Points</option>
								<option value="lowest">Lowest Points</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{showForm && (
				<div className="assessment-form-container">
					<form onSubmit={handleSubmit} className="assessment-form">
						<div className="form-header">
							<h2>{editingId ? "Edit Assessment" : "Create New Assessment"}</h2>
							<button
								type="button"
								className="close-form"
								onClick={handleCancel}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>

						<div className="form-body">
							<div className="form-group">
								<label htmlFor="title">Title</label>
								<input
									type="text"
									id="title"
									name="title"
									value={newAssessment.title}
									onChange={handleInputChange}
									placeholder="Enter assessment title"
									required
								/>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label htmlFor="type">Type</label>
									<select
										id="type"
										name="type"
										value={newAssessment.type}
										onChange={handleInputChange}
									>
										{assessmentTypes.map((type) => (
											<option key={type} value={type}>
												{type}
											</option>
										))}
									</select>
								</div>

								<div className="form-group">
									<label htmlFor="points">Points</label>
									<input
										type="number"
										id="points"
										name="points"
										value={newAssessment.points}
										onChange={handleInputChange}
										min="1"
										max="100"
										placeholder="Points value"
										required
									/>
									<div className="points-guidance">
										{isOverLimit ? (
											<small className="warning">
												Total will exceed 100 points limit
											</small>
										) : (
											<small>{remainingPoints} points available</small>
										)}
									</div>
								</div>

								<div className="form-group">
									<label htmlFor="date">Date</label>
									<input
										type="date"
										id="date"
										name="date"
										value={newAssessment.date}
										onChange={handleInputChange}
										required
									/>
								</div>
							</div>
						</div>

						<div className="form-actions">
							<button type="submit" className="btn-save">
								<FontAwesomeIcon icon={faCheck} />{" "}
								{editingId ? "Update" : "Save"}
							</button>
							<button
								type="button"
								className="btn-cancel"
								onClick={handleCancel}
							>
								<FontAwesomeIcon icon={faTimes} /> Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			<div className="assessments-content">
				{loading ? (
					<div className="loading-state">
						<div className="loading-spinner"></div>
						<p>Loading assessments...</p>
					</div>
				) : filteredAndSortedAssessments.length === 0 ? (
					<div className="empty-state">
						{searchTerm || filterType !== "All" ? (
							<>
								<h3>No matching assessments found</h3>
								<p>Try adjusting your search or filters</p>
								<button
									className="btn-clear-filters"
									onClick={() => {
										setSearchTerm("");
										setFilterType("All");
									}}
								>
									Clear All Filters
								</button>
							</>
						) : (
							<>
								<h3>No assessments yet</h3>
								<p>Create your first assessment to get started</p>
								<button
									className="btn-add-first"
									onClick={() => setShowForm(true)}
								>
									<FontAwesomeIcon icon={faPlus} /> Add Assessment
								</button>
							</>
						)}
					</div>
				) : (
					<div className="assessments-list">
						{sortedMonths.map((month) => (
							<div key={month} className="month-group">
								<div className="month-header">
									<FontAwesomeIcon
										icon={faCalendarAlt}
										className="month-icon"
									/>
									<h2>{month}</h2>
									<span className="assessment-count">
										{groupedAssessments[month].length} assessment
										{groupedAssessments[month].length !== 1 ? "s" : ""}
									</span>
								</div>
								<div className="month-assessments">
									{groupedAssessments[month]
										.sort((a, b) => new Date(a.date) - new Date(b.date))
										.map((assessment) => (
											<div key={assessment.id} className="assessment-card">
												<div className="card-header">
													<span
														className={`type-badge ${assessment.type.toLowerCase()}`}
													>
														{assessment.type}
													</span>
													<span className="points-badge">
														{assessment.points} pts
													</span>
												</div>
												<div className="card-body">
													<h3 className="assessment-title">
														{assessment.title}
													</h3>
													<p className="assessment-date">
														<FontAwesomeIcon icon={faCalendarAlt} />
														{new Date(assessment.date).toLocaleDateString(
															undefined,
															{
																weekday: "short",
																month: "short",
																day: "numeric",
															}
														)}
													</p>
												</div>
												<div className="card-actions">
													<button
														className="btn-edit"
														onClick={() => handleEdit(assessment)}
														aria-label="Edit assessment"
													>
														<FontAwesomeIcon icon={faEdit} />
													</button>
													<button
														className="btn-delete"
														onClick={() => handleDelete(assessment.id)}
														aria-label="Delete assessment"
													>
														<FontAwesomeIcon icon={faTrashAlt} />
													</button>
												</div>
											</div>
										))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Assessments;
