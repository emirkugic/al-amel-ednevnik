import React, { useState, useEffect, useRef } from "react";
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
import AssessmentGradesModal from "../AssessmentGradesModal/AssessmentGradesModal";

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

// Assessment Grades Modal Component

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
	const [assessmentsLoading, setAssessmentsLoading] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState("");

	// Use refs to track previous values and prevent infinite loops
	const prevDeptRef = useRef(null);

	// Modal state
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);

	// Form state
	const [title, setTitle] = useState("");
	const [type, setType] = useState("Exam");
	const [points, setPoints] = useState("");
	const [formMonth, setFormMonth] = useState("");

	// Get school year
	const { start } = calculateSchoolYear();

	// Find current subject from assigned subjects
	const currentSubject = assignedSubjects.find(
		(subj) => subj.subjectId === subject
	);
	const departmentIds = currentSubject ? currentSubject.departmentId : [];

	// Helper function to get first day of a month
	const getFirstDayOfMonth = (month) => {
		const monthIndex = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		].indexOf(month);

		// Determine year based on semester and current date
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth(); // 0-11

		let year = currentYear;

		// If we're in the first semester (Sep-Dec) of current year
		if (selectedSemester === "First Semester") {
			// If selecting for next year's first semester but we're still in current year
			if (
				currentMonth < 8 &&
				["September", "October", "November", "December"].includes(month)
			) {
				year = currentYear - 1;
			}
		}
		// If we're in second semester (Feb-May)
		else if (selectedSemester === "Second Semester") {
			// If we're in the fall and selecting for spring months, use next year
			if (
				currentMonth >= 8 &&
				["February", "March", "April", "May"].includes(month)
			) {
				year = currentYear + 1;
			}
		}

		return new Date(year, monthIndex, 1);
	};

	// Modal functions
	const openGradesModal = async (assessment) => {
		try {
			setSelectedAssessment(assessment);
			setIsGradesModalOpen(true);
		} catch (err) {
			console.error("Error opening grades modal:", err);
		}
	};

	const closeGradesModal = () => {
		setIsGradesModalOpen(false);
		setSelectedAssessment(null);
	};

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
	}, [departmentIds, user?.token]); // Removed selectedDepartment from dependencies

	// Fetch assessments when department or subject changes
	useEffect(() => {
		// Skip if nothing changed or missing required data
		if (!user?.id || !subject || !selectedDepartment) return;

		// Prevent duplicate fetches for the same department
		if (prevDeptRef.current === selectedDepartment) return;

		const fetchAssessments = async () => {
			try {
				setAssessmentsLoading(true);
				await fetchFilteredAssessments(
					user.id,
					subject,
					selectedDepartment,
					start
				);
				// Store the current department we just fetched for
				prevDeptRef.current = selectedDepartment;
			} catch (error) {
				console.error("Error fetching assessments:", error);
			} finally {
				setAssessmentsLoading(false);
			}
		};

		fetchAssessments();
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
			setFormMonth(currentMonth); // Set form month as well
		} else {
			// Otherwise, select the first month of the semester
			setSelectedMonth(monthsToDisplay[0]);
			setFormMonth(monthsToDisplay[0]); // Set form month as well
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
			!formMonth
		) {
			alert("Please fill in all fields");
			return;
		}

		try {
			const dateObj = getFirstDayOfMonth(formMonth);
			const formattedDate = dateObj.toISOString();

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
			// Don't reset formMonth so it stays on the same month for the next assessment
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

	// Get current month's assessments
	const currentMonthAssessments = selectedMonth
		? groupedAssessments[selectedMonth] || []
		: [];

	// Calculate total points for selected month
	const totalMonthPoints = currentMonthAssessments.reduce(
		(sum, a) => sum + Number(a.points),
		0
	);

	// Show loading state if user not authenticated yet
	if (!user?.token) {
		return (
			<div className="asmnt-page">
				<div className="asmnt-dashboard-card asmnt-loading-container">
					<div className="asmnt-loading-spinner"></div>
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="asmnt-page">
			<div className="asmnt-dashboard-card">
				{/* Header */}
				<header className="asmnt-header">
					<div className="asmnt-title">
						<h1>
							<FontAwesomeIcon
								icon={faGraduationCap}
								className="asmnt-title-icon"
							/>
							Assessment Management
						</h1>
					</div>
				</header>

				{/* Main layout */}
				<div
					className={`asmnt-layout ${
						assessmentsLoading ? "assessments-loading" : ""
					}`}
				>
					{/* Sidebar with controls */}
					<aside className="asmnt-sidebar">
						{/* Semester switch */}
						<div className="asmnt-semester-switch">
							<label className="asmnt-semester-switch-label">Semester</label>
							<div className="asmnt-semester-tabs">
								<div
									className={`asmnt-semester-tab ${
										selectedSemester === "First Semester" ? "active" : ""
									}`}
									onClick={() => setSelectedSemester("First Semester")}
								>
									First Semester
								</div>
								<div
									className={`asmnt-semester-tab ${
										selectedSemester === "Second Semester" ? "active" : ""
									}`}
									onClick={() => setSelectedSemester("Second Semester")}
								>
									Second Semester
								</div>
							</div>
						</div>

						{/* Department selector */}
						<div className="asmnt-department-selector">
							<label className="asmnt-selector-label">Department</label>
							<select
								className="asmnt-selector-control"
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
						<div className="asmnt-sidebar-section">
							<h2 className="asmnt-section-title">
								<FontAwesomeIcon
									icon={faPlus}
									className="asmnt-section-title-icon"
								/>
								Add New Assessment
							</h2>

							<div className="asmnt-form-group">
								<label className="asmnt-form-label" htmlFor="title">
									Assessment Title
								</label>
								<input
									id="title"
									type="text"
									className="asmnt-form-control"
									placeholder="Enter assessment title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
							</div>

							<div className="asmnt-form-group">
								<label className="asmnt-form-label" htmlFor="type">
									Assessment Type
								</label>
								<select
									id="type"
									className="asmnt-form-control"
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

							<div className="asmnt-form-row">
								<div className="asmnt-form-group">
									<label className="asmnt-form-label" htmlFor="points">
										Points
									</label>
									<input
										id="points"
										type="number"
										className="asmnt-form-control"
										placeholder="Points"
										min="0"
										max="100"
										value={points}
										onChange={(e) => setPoints(e.target.value)}
									/>
								</div>

								<div className="asmnt-form-group">
									<label className="asmnt-form-label" htmlFor="month">
										Month
									</label>
									<select
										id="month"
										className="asmnt-form-control"
										value={formMonth}
										onChange={(e) => setFormMonth(e.target.value)}
									>
										{monthsToDisplay.map((month) => (
											<option key={month} value={month}>
												{month}
											</option>
										))}
									</select>
								</div>
							</div>

							<button
								className="asmnt-btn asmnt-btn-primary asmnt-btn-block"
								onClick={handleAddAssessment}
								disabled={!selectedDepartment}
							>
								<FontAwesomeIcon icon={faPlus} /> Add Assessment
							</button>
						</div>
					</aside>

					{/* Main content area */}
					<main className="asmnt-content">
						{/* Month navigation */}
						<div className="asmnt-month-nav">
							<div className="asmnt-month-nav-header">
								<h3 className="asmnt-month-nav-title">
									<FontAwesomeIcon icon={faCalendarAlt} /> Monthly Assessments
								</h3>
							</div>

							<div className="asmnt-month-indicators">
								{monthsToDisplay.map((month) => {
									const monthAssessments = groupedAssessments[month] || [];
									const monthPoints = monthAssessments.reduce(
										(sum, a) => sum + Number(a.points),
										0
									);

									return (
										<div
											key={month}
											className={`asmnt-month-indicator ${
												selectedMonth === month ? "active" : ""
											}`}
											onClick={() => setSelectedMonth(month)}
										>
											<span className="asmnt-month-name">{month}</span>
											<span className="asmnt-month-points">
												<FontAwesomeIcon icon={faCalculator} />
												{monthPoints} pts
											</span>
										</div>
									);
								})}
							</div>
						</div>

						{/* Assessment list */}
						<div className="asmnt-assessment-list">
							{assessmentsLoading ? (
								<div className="asmnt-assessment-empty">
									<div className="asmnt-loading-spinner"></div>
									<p>Loading assessments...</p>
								</div>
							) : currentMonthAssessments.length > 0 ? (
								<>
									<div className="asmnt-month-summary">
										<div className="asmnt-month-total">
											<FontAwesomeIcon icon={faCalculator} />
											{totalMonthPoints} points total
										</div>
										<div className="asmnt-month-count">
											<FontAwesomeIcon icon={faChartBar} />
											{currentMonthAssessments.length} assessments
										</div>
									</div>

									<div className="asmnt-assessment-grid">
										{currentMonthAssessments.map((assessment) => (
											<div
												key={assessment.id}
												className="asmnt-assessment-item"
												onClick={() => openGradesModal(assessment)}
											>
												<div className="asmnt-assessment-item-header">
													<div className="asmnt-assessment-type">
														<FontAwesomeIcon
															icon={getAssessmentTypeIcon(assessment.type)}
															className="asmnt-assessment-type-icon"
														/>
														{assessment.type}
													</div>
												</div>

												<div className="asmnt-assessment-item-body">
													<h3 className="asmnt-assessment-item-title">
														{assessment.title}
													</h3>

													<div className="asmnt-assessment-meta">
														<div className="asmnt-assessment-points">
															{assessment.points}
															<span className="asmnt-assessment-points-label">
																points
															</span>
														</div>

														<div className="asmnt-assessment-actions">
															<button
																className="asmnt-action-btn delete"
																onClick={(e) =>
																	handleDeleteAssessment(e, assessment.id)
																}
																title="Delete assessment"
															>
																<FontAwesomeIcon icon={faTrashAlt} />
															</button>
															<button
																className="asmnt-action-btn grade"
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	openGradesModal(assessment);
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
								<div className="asmnt-assessment-empty">
									No assessments scheduled for {selectedMonth}
								</div>
							)}
						</div>
					</main>
				</div>
			</div>

			{isGradesModalOpen && selectedAssessment && (
				<AssessmentGradesModal
					assessment={selectedAssessment}
					token={user?.token}
					onClose={closeGradesModal}
				/>
			)}
		</div>
	);
};

export default AssessmentManagement;
