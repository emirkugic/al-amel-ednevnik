import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faGraduationCap,
	faCalendarAlt,
	faPlus,
	faTrashAlt,
	faClipboardList,
	faFileAlt,
	faQuestionCircle,
	faProjectDiagram,
	faHome,
	faTasks,
	faBookOpen,
	faCalculator,
	faChartBar,
	faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../../../hooks/useAuth";
import useAssessments from "../../../../hooks/useAssessments";
import departmentApi from "../../../../api/departmentApi";
import "./AssessmentManagement.css";

// Constants
const FIRST_SEMESTER_MONTHS = ["September", "October", "November", "December"];
const SECOND_SEMESTER_MONTHS = ["February", "March", "April", "May"];
const ASSESSMENT_TYPES = [
	"Exam",
	"Quiz",
	"Project",
	"Homework",
	"Activity",
	"Book report",
	"Other",
];

// Helper to calculate current school year
const calculateSchoolYear = () => {
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;

	return {
		start: month >= 9 ? `${year}-09-01` : `${year - 1}-09-01`,
		end: month >= 9 ? `${year + 1}-08-31` : `${year}-08-31`,
	};
};

// Get icon for assessment type
const getAssessmentTypeIcon = (type) => {
	switch (type?.toLowerCase()) {
		case "exam":
			return faFileAlt;
		case "quiz":
			return faQuestionCircle;
		case "project":
			return faProjectDiagram;
		case "homework":
			return faHome;
		case "activity":
			return faTasks;
		case "book report":
			return faBookOpen;
		default:
			return faClipboardList;
	}
};

const AssessmentManagement = () => {
	// Get subject ID from URL params
	const { subject } = useParams();

	// Hook into authentication and assessments
	const { user, assignedSubjects } = useAuth();
	const {
		assessments,
		fetchFilteredAssessments,
		addAssessment,
		deleteAssessment,
	} = useAssessments(user?.token);

	// State management
	const [selectedSemester, setSelectedSemester] = useState("Second Semester");
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [departmentNames, setDepartmentNames] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState("");

	// Form state
	const [title, setTitle] = useState("");
	const [type, setType] = useState("Exam");
	const [points, setPoints] = useState("");
	const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

	// Get school year
	const { start } = calculateSchoolYear();

	// Find current subject from assigned subjects
	const currentSubject = assignedSubjects.find(
		(subj) => subj.subjectId === subject
	);
	const departmentIds = currentSubject ? currentSubject.departmentId : [];

	// Fetch department names
	useEffect(() => {
		const fetchDepartmentNames = async () => {
			try {
				setLoading(true);
				const promises = departmentIds.map((id) =>
					departmentApi.getDepartmentById(id, user?.token)
				);
				const departments = await Promise.all(promises);
				const names = departments.map((dept) => ({
					id: dept.id,
					name: dept.departmentName,
				}));
				setDepartmentNames(names);

				// Select first department if none selected
				if (!selectedDepartment && names.length > 0) {
					setSelectedDepartment(names[0].id);
				}
			} catch (error) {
				console.error("Error fetching department names:", error);
			} finally {
				setLoading(false);
			}
		};

		if (departmentIds.length > 0 && user?.token) {
			fetchDepartmentNames();
		}
	}, [departmentIds, user?.token, selectedDepartment]);

	// Fetch assessments when department or subject changes
	useEffect(() => {
		if (user?.id && subject && selectedDepartment) {
			fetchFilteredAssessments(user.id, subject, selectedDepartment, start);
		}
	}, [user?.id, subject, selectedDepartment, start, fetchFilteredAssessments]);

	// Set default selected month
	useEffect(() => {
		const monthsToDisplay =
			selectedSemester === "First Semester"
				? FIRST_SEMESTER_MONTHS
				: SECOND_SEMESTER_MONTHS;

		// Get current month name
		const currentMonth = new Date().toLocaleString("default", {
			month: "long",
		});

		// Check if current month is in the selected semester
		if (monthsToDisplay.includes(currentMonth)) {
			setSelectedMonth(currentMonth);
		} else {
			// Otherwise, select the first month of the semester
			setSelectedMonth(monthsToDisplay[0]);
		}
	}, [selectedSemester]);

	// Group assessments by month
	const groupedAssessments = assessments.reduce((acc, assessment) => {
		const monthName = new Date(assessment.date).toLocaleString("default", {
			month: "long",
		});
		if (!acc[monthName]) acc[monthName] = [];
		acc[monthName].push(assessment);
		return acc;
	}, {});

	// Get months to display based on semester
	const monthsToDisplay =
		selectedSemester === "First Semester"
			? FIRST_SEMESTER_MONTHS
			: SECOND_SEMESTER_MONTHS;

	// Handle adding a new assessment
	const handleAddAssessment = async () => {
		if (
			!selectedDepartment ||
			!subject ||
			!title ||
			!type ||
			!points ||
			!date
		) {
			alert("Please fill in all fields");
			return;
		}

		try {
			const formattedDate = new Date(date).toISOString();
			const newAssessment = {
				departmentId: selectedDepartment,
				subjectId: subject,
				teacherId: user.id,
				title,
				type,
				points,
				date: formattedDate,
			};

			await addAssessment(newAssessment);

			// Reset form fields
			setTitle("");
			setType("Exam");
			setPoints("");
			setDate(new Date().toISOString().substring(0, 10));
		} catch (error) {
			console.error("Error adding assessment:", error);
		}
	};

	// Delete an assessment
	const handleDeleteAssessment = (e, assessmentId) => {
		e.stopPropagation();
		e.preventDefault();
		if (window.confirm("Are you sure you want to delete this assessment?")) {
			deleteAssessment(assessmentId);
		}
	};

	// Format date for display
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("default", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Get current month's assessments
	const currentMonthAssessments = selectedMonth
		? groupedAssessments[selectedMonth] || []
		: [];

	// Calculate total points for selected month
	const totalMonthPoints = currentMonthAssessments.reduce(
		(sum, a) => sum + Number(a.points),
		0
	);

	return (
		<div className="assessment-page">
			<div className="assessment-card">
				{/* Header */}
				<header className="assessment-header">
					<h1 className="assessment-title">
						<FontAwesomeIcon
							icon={faGraduationCap}
							className="assessment-title-icon"
						/>
						Assessment Management
					</h1>
				</header>

				{/* Main layout */}
				<div className="assessment-layout">
					{/* Sidebar with controls */}
					<aside className="assessment-sidebar">
						{/* Semester switch */}
						<div className="semester-switch">
							<label className="semester-switch-label">Semester</label>
							<div className="semester-tabs">
								<div
									className={`semester-tab ${
										selectedSemester === "First Semester" ? "active" : ""
									}`}
									onClick={() => setSelectedSemester("First Semester")}
								>
									First Semester
								</div>
								<div
									className={`semester-tab ${
										selectedSemester === "Second Semester" ? "active" : ""
									}`}
									onClick={() => setSelectedSemester("Second Semester")}
								>
									Second Semester
								</div>
							</div>
						</div>

						{/* Department selector */}
						<div className="department-selector">
							<label className="selector-label">Department</label>
							<select
								className="selector-control"
								value={selectedDepartment || ""}
								onChange={(e) => setSelectedDepartment(e.target.value)}
								disabled={loading || departmentNames.length === 0}
							>
								<option value="" disabled>
									{loading
										? "Loading departments..."
										: "-- Select Department --"}
								</option>
								{departmentNames.map((dept) => (
									<option key={dept.id} value={dept.id}>
										{dept.name}
									</option>
								))}
							</select>
						</div>

						{/* Add Assessment form */}
						<div className="sidebar-section">
							<h2 className="section-title">
								<FontAwesomeIcon icon={faPlus} className="section-title-icon" />
								Add New Assessment
							</h2>

							<div className="form-group">
								<label className="form-label" htmlFor="title">
									Assessment Title
								</label>
								<input
									id="title"
									type="text"
									className="form-control"
									placeholder="Enter assessment title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
							</div>

							<div className="form-group">
								<label className="form-label" htmlFor="type">
									Assessment Type
								</label>
								<select
									id="type"
									className="form-control"
									value={type}
									onChange={(e) => setType(e.target.value)}
								>
									{ASSESSMENT_TYPES.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label className="form-label" htmlFor="points">
										Points
									</label>
									<input
										id="points"
										type="number"
										className="form-control"
										placeholder="Points"
										min="0"
										max="100"
										value={points}
										onChange={(e) => setPoints(e.target.value)}
									/>
								</div>

								<div className="form-group">
									<label className="form-label" htmlFor="date">
										Date
									</label>
									<input
										id="date"
										type="date"
										className="form-control"
										value={date}
										onChange={(e) => setDate(e.target.value)}
									/>
								</div>
							</div>

							<button
								className="btn btn-primary btn-block"
								onClick={handleAddAssessment}
								disabled={!selectedDepartment}
							>
								<FontAwesomeIcon icon={faPlus} /> Add Assessment
							</button>
						</div>
					</aside>

					{/* Main content area */}
					<main className="assessment-content">
						{/* Month navigation */}
						<div className="month-nav">
							<div className="month-nav-header">
								<h3 className="month-nav-title">
									<FontAwesomeIcon icon={faCalendarAlt} /> Monthly Assessments
								</h3>
							</div>

							<div className="month-indicators">
								{monthsToDisplay.map((month) => {
									const monthAssessments = groupedAssessments[month] || [];
									const monthPoints = monthAssessments.reduce(
										(sum, a) => sum + Number(a.points),
										0
									);

									return (
										<div
											key={month}
											className={`month-indicator ${
												selectedMonth === month ? "active" : ""
											}`}
											onClick={() => setSelectedMonth(month)}
										>
											<span className="month-name">{month}</span>
											<span className="month-points">
												<FontAwesomeIcon icon={faCalculator} />
												{monthPoints} pts
											</span>
										</div>
									);
								})}
							</div>

							{/* <div className="points-overview">
								<table className="points-table">
									<thead>
										<tr>
											{monthsToDisplay.map((month) => (
												<th
													key={month}
													className={
														selectedMonth === month ? "month-current" : ""
													}
												>
													{month.substring(0, 3)}
												</th>
											))}
											<th>Total</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											{monthsToDisplay.map((month) => {
												const monthAssessments =
													groupedAssessments[month] || [];
												const monthPoints = monthAssessments.reduce(
													(sum, a) => sum + Number(a.points),
													0
												);

												return (
													<td
														key={month}
														className={
															monthPoints === 0
																? "points-zero"
																: monthPoints > 30
																? "points-high"
																: ""
														}
													>
														{monthPoints > 0 ? `${monthPoints} pts` : "-"}
													</td>
												);
											})}
											<td className="points-high">
												{assessments.reduce(
													(sum, a) => sum + Number(a.points),
													0
												)}{" "}
												pts
											</td>
										</tr>
									</tbody>
								</table>
							</div> */}
						</div>

						{/* Assessment list */}
						<div className="assessment-list">
							{currentMonthAssessments.length > 0 ? (
								<>
									<div className="month-summary">
										<div className="month-total">
											<FontAwesomeIcon icon={faCalculator} />
											{totalMonthPoints} points total
										</div>
										<div className="month-count">
											<FontAwesomeIcon icon={faChartBar} />
											{currentMonthAssessments.length} assessments
										</div>
									</div>

									<div className="assessment-grid">
										{currentMonthAssessments.map((assessment) => (
											<div key={assessment.id} className="assessment-item">
												<div className="assessment-item-header">
													<div className="assessment-type">
														<FontAwesomeIcon
															icon={getAssessmentTypeIcon(assessment.type)}
															className="assessment-type-icon"
														/>
														{assessment.type}
													</div>
													<div className="assessment-date">
														<FontAwesomeIcon icon={faCalendarAlt} />
														{formatDate(assessment.date)}
													</div>
												</div>

												<div className="assessment-item-body">
													<h3 className="assessment-item-title">
														{assessment.title}
													</h3>

													<div className="assessment-meta">
														<div className="assessment-points">
															{assessment.points}
															<span className="assessment-points-label">
																points
															</span>
														</div>

														<div className="assessment-actions">
															<button
																className="action-btn delete"
																onClick={(e) =>
																	handleDeleteAssessment(e, assessment.id)
																}
																title="Delete assessment"
															>
																<FontAwesomeIcon icon={faTrashAlt} />
															</button>
															<button
																className="action-btn grade"
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	// This will be implemented later
																	alert(
																		"Grading functionality will be added later"
																	);
																}}
																title="Grade assessments"
															>
																<FontAwesomeIcon icon={faChevronRight} />
															</button>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</>
							) : (
								<div className="assessment-empty">
									No assessments scheduled for {selectedMonth}
								</div>
							)}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
};

export default AssessmentManagement;
