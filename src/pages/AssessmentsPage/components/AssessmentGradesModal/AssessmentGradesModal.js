import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTimes,
	faPen,
	faSave,
	faExclamationCircle,
	faSearch,
	faCalculator,
	faCheckCircle,
	faChartLine,
	faAward,
	faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "./AssessmentGradesModal.css";
import useGrades from "../../../../hooks/useGrades";

const AssessmentGradesModal = ({ assessment, token, onClose }) => {
	const { grades, fetchGrades, updateGrade, createGrade } = useGrades(token);
	const [editing, setEditing] = useState({});
	const [localGrades, setLocalGrades] = useState({});
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [notification, setNotification] = useState(null);
	const [stats, setStats] = useState({
		average: 0,
		highest: 0,
		lowest: 0,
		graded: 0,
		ungraded: 0,
	});

	// Fetch grades on mount
	useEffect(() => {
		let isMounted = true;

		if (assessment) {
			setIsLoading(true);
			fetchGrades(assessment.id)
				.then(() => {
					if (isMounted) {
						setIsLoading(false);
					}
				})
				.catch((err) => {
					console.error("Error fetching grades:", err);
					if (isMounted) {
						showNotification(
							"error",
							"Failed to load grades. Please try again."
						);
						setIsLoading(false);
					}
				});
		}

		// Cleanup function to prevent state updates on unmounted component
		return () => {
			isMounted = false;
		};
	}, [assessment.id]);

	// Initialize local grades from fetched data only once when grades are loaded
	useEffect(() => {
		if (grades.length > 0 && Object.keys(localGrades).length === 0) {
			setLocalGrades(
				grades.reduce((acc, grade) => {
					acc[grade.studentId] = grade.grade || "";
					return acc;
				}, {})
			);

			// Calculate statistics
			calculateStats();
		}
	}, [grades]);

	// Calculate grade statistics
	const calculateStats = useCallback(() => {
		const gradedValues = grades
			.filter((g) => g.grade && g.grade.trim() !== "")
			.map((g) => parseFloat(g.grade));

		const graded = gradedValues.length;
		const ungraded = grades.length - graded;

		if (gradedValues.length > 0) {
			const sum = gradedValues.reduce((a, b) => a + b, 0);
			const highest = Math.max(...gradedValues);
			const lowest = Math.min(...gradedValues);
			const average = sum / gradedValues.length;

			setStats({
				average: average.toFixed(1),
				highest: highest.toFixed(1),
				lowest: lowest.toFixed(1),
				graded,
				ungraded,
			});
		} else {
			setStats({
				average: 0,
				highest: 0,
				lowest: 0,
				graded,
				ungraded,
			});
		}
	}, [grades]);

	// Show notification
	const showNotification = (type, message) => {
		setNotification({ type, message });
		setTimeout(() => {
			setNotification(null);
		}, 3000);
	};

	// Handle grade input change
	const handleGradeChange = (studentId, grade) => {
		// Allow empty string for clearing grades
		if (grade === "") {
			setLocalGrades((prev) => ({ ...prev, [studentId]: "" }));
			return;
		}

		// Only allow numbers and decimal point
		const validGradeRegex = /^(\d*\.?\d*)$/;
		if (!validGradeRegex.test(grade)) {
			return;
		}

		// Convert to number to check range
		const numericGrade = parseFloat(grade);

		// Don't allow negative numbers
		if (numericGrade < 0) {
			return;
		}

		// Don't allow grades higher than max points
		if (numericGrade > Number(assessment.points)) {
			return;
		}

		// Update local state with valid input
		setLocalGrades((prev) => ({ ...prev, [studentId]: grade }));
	};

	// Save grade - optimistically update UI first to prevent glitches
	const saveGrade = async (studentId) => {
		const originalGrades = { ...localGrades };
		const gradeToUpdate = grades.find((g) => g.studentId === studentId);
		const gradeValue = localGrades[studentId];

		// Final validation before saving
		if (gradeValue !== "") {
			const numericGrade = parseFloat(gradeValue);

			// Check for invalid values
			if (isNaN(numericGrade)) {
				showNotification(
					"error",
					"Invalid grade value. Please enter a valid number."
				);
				return;
			}

			// Check for negative values
			if (numericGrade < 0) {
				showNotification("error", "Grades cannot be negative.");
				return;
			}

			// Check for exceeding maximum points
			if (numericGrade > Number(assessment.points)) {
				showNotification(
					"error",
					`Grade cannot exceed the maximum points (${assessment.points})`
				);
				return;
			}
		}

		// Remove from editing state immediately to prevent flicker
		setEditing((prev) => ({ ...prev, [studentId]: false }));

		try {
			// If no existing grade, create new one
			if (!gradeToUpdate || !gradeToUpdate.gradeId) {
				await createGrade({
					studentId,
					subjectAssessmentId: assessment.id,
					grade: String(gradeValue),
				});
			} else if (gradeToUpdate.grade !== gradeValue) {
				// Otherwise update existing grade
				await updateGrade(gradeToUpdate.gradeId, {
					id: gradeToUpdate.gradeId,
					subjectAssessmentId: assessment.id,
					studentId,
					grade: String(gradeValue),
				});
			}

			// Update the stats without triggering a re-fetch
			const updatedGrades = grades.map((g) => {
				if (g.studentId === studentId) {
					return { ...g, grade: gradeValue };
				}
				return g;
			});

			// Calculate stats manually without fetching
			const gradedValues = updatedGrades
				.filter((g) => g.grade && g.grade.trim() !== "")
				.map((g) => parseFloat(g.grade));

			const graded = gradedValues.length;
			const ungraded = updatedGrades.length - graded;

			if (gradedValues.length > 0) {
				const sum = gradedValues.reduce((a, b) => a + b, 0);
				const highest = Math.max(...gradedValues);
				const lowest = Math.min(...gradedValues);
				const average = sum / gradedValues.length;

				setStats({
					average: average.toFixed(1),
					highest: highest.toFixed(1),
					lowest: lowest.toFixed(1),
					graded,
					ungraded,
				});
			}

			showNotification("success", "Grade saved successfully");
		} catch (err) {
			console.error("Error saving grade:", err);
			// Revert to original grade on error
			setLocalGrades(originalGrades);
			setEditing((prev) => ({ ...prev, [studentId]: true }));
			showNotification("error", "Failed to save grade. Please try again.");
		}
	};

	// Filter students based on search term
	const filteredGrades = grades.filter((grade) =>
		grade && grade.studentName
			? grade.studentName.toLowerCase().includes(searchTerm.toLowerCase())
			: false
	);

	// Handle enter key in grade input
	const handleKeyDown = (e, studentId) => {
		if (e.key === "Enter") {
			saveGrade(studentId);
		}
	};

	return (
		<div className="agm-modal-overlay">
			<div className="agm-modal-container">
				<div className="agm-modal-content">
					{/* Header */}
					<div className="agm-modal-header">
						<h2 className="agm-title">
							{assessment.title}
							<span className="agm-subtitle">
								{assessment.type} • {assessment.points} points
							</span>
						</h2>
						<button className="agm-close-button" onClick={onClose}>
							<FontAwesomeIcon icon={faTimes} />
						</button>
					</div>

					{/* Notification */}
					{notification && (
						<div
							className={`agm-notification agm-notification-${notification.type}`}
						>
							<FontAwesomeIcon
								icon={
									notification.type === "success"
										? faCheckCircle
										: faExclamationCircle
								}
							/>
							<span>{notification.message}</span>
							<button onClick={() => setNotification(null)}>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
					)}

					{/* Loading indicator */}
					{isLoading && <div className="agm-loading-indicator"></div>}

					{/* Top section with search and stats */}
					<div className="agm-top-section">
						<div className="agm-search-container">
							<FontAwesomeIcon icon={faSearch} className="agm-search-icon" />
							<input
								type="text"
								className="agm-search-input"
								placeholder="Search students..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						<div className="agm-stats-container">
							<div className="agm-stat-item">
								<FontAwesomeIcon
									icon={faCalculator}
									className="agm-stat-icon"
								/>
								<div className="agm-stat-value">{stats.average}</div>
								<div className="agm-stat-label">Average</div>
							</div>
							<div className="agm-stat-item">
								<FontAwesomeIcon icon={faAward} className="agm-stat-icon" />
								<div className="agm-stat-value">{stats.highest}</div>
								<div className="agm-stat-label">Highest</div>
							</div>
							<div className="agm-stat-item">
								<FontAwesomeIcon
									icon={faExclamationTriangle}
									className="agm-stat-icon"
								/>
								<div className="agm-stat-value">{stats.lowest}</div>
								<div className="agm-stat-label">Lowest</div>
							</div>
							<div className="agm-stat-item">
								<FontAwesomeIcon icon={faChartLine} className="agm-stat-icon" />
								<div className="agm-stat-value">
									{stats.graded}/{grades.length}
								</div>
								<div className="agm-stat-label">Graded</div>
							</div>
						</div>
					</div>

					{/* Student grades table */}
					<div className="agm-students-container">
						{filteredGrades.length > 0 ? (
							filteredGrades.map((grade) => (
								<div
									key={grade.studentId}
									className={`agm-student-row ${
										editing[grade.studentId] ? "agm-editing" : ""
									}`}
								>
									<div className="agm-student-name">{grade.studentName}</div>
									<div className="agm-student-grade">
										{editing[grade.studentId] ? (
											<input
												type="text"
												className="agm-grade-input"
												value={localGrades[grade.studentId]}
												onChange={(e) =>
													handleGradeChange(grade.studentId, e.target.value)
												}
												onKeyDown={(e) => handleKeyDown(e, grade.studentId)}
												autoFocus
											/>
										) : (
											<span
												className={`agm-grade-display ${
													!localGrades[grade.studentId] ? "agm-not-graded" : ""
												}`}
											>
												{localGrades[grade.studentId] || "Not Graded"}
											</span>
										)}
									</div>
									<div className="agm-student-actions">
										{editing[grade.studentId] ? (
											<button
												onClick={() => saveGrade(grade.studentId)}
												className="agm-button agm-save-button"
												title="Save grade"
											>
												<FontAwesomeIcon icon={faSave} />
												<span>Save</span>
											</button>
										) : (
											<button
												onClick={() =>
													setEditing({ ...editing, [grade.studentId]: true })
												}
												className="agm-button agm-edit-button"
												title="Edit grade"
											>
												<FontAwesomeIcon icon={faPen} />
												<span>Edit</span>
											</button>
										)}
									</div>
								</div>
							))
						) : (
							<div className="agm-no-results">
								<p>No students found matching your search criteria.</p>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="agm-modal-footer">
						<button className="agm-close-btn" onClick={onClose}>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssessmentGradesModal;
