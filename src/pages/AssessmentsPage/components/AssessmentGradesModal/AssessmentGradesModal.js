import React, { useState, useEffect, useCallback, useRef } from "react";
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
	faFilter,
	faFileExport,
	faSortAmountDown,
	faSortAmountUp,
	faKeyboard,
	faLightbulb,
	faPercentage,
	faQuestionCircle,
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

	// New state variables for enhanced functionality
	const [sortConfig, setSortConfig] = useState({
		key: "studentName",
		direction: "asc",
	});
	const [filterMode, setFilterMode] = useState("all"); // 'all', 'graded', 'ungraded'
	const [selectedRows, setSelectedRows] = useState([]);
	const [quickEditMode, setQuickEditMode] = useState(false);
	const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
	const [customGradeValue, setCustomGradeValue] = useState("");
	const currentFocusRef = useRef(null);
	const inputRefs = useRef({});

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

			// If in quick edit mode, move focus to next student
			if (quickEditMode) {
				moveFocusToNextStudent(studentId);
			}
		} catch (err) {
			console.error("Error saving grade:", err);
			// Revert to original grade on error
			setLocalGrades(originalGrades);
			setEditing((prev) => ({ ...prev, [studentId]: true }));
			showNotification("error", "Failed to save grade. Please try again.");
		}
	};

	// New functionality: Batch save selected grades with a specific value
	const saveSelectedGrades = async (value) => {
		if (selectedRows.length === 0) {
			showNotification("error", "No students selected");
			return;
		}

		const numericValue = parseFloat(value);

		// Validate the value
		if (
			isNaN(numericValue) ||
			numericValue < 0 ||
			numericValue > Number(assessment.points)
		) {
			showNotification(
				"error",
				`Grade must be between 0 and ${assessment.points}`
			);
			return;
		}

		// Update local grades first
		const updatedLocalGrades = { ...localGrades };
		selectedRows.forEach((studentId) => {
			updatedLocalGrades[studentId] = value;
		});
		setLocalGrades(updatedLocalGrades);

		// Save each grade
		try {
			setIsLoading(true);
			const promises = selectedRows.map(async (studentId) => {
				const gradeToUpdate = grades.find((g) => g.studentId === studentId);

				if (!gradeToUpdate || !gradeToUpdate.gradeId) {
					return createGrade({
						studentId,
						subjectAssessmentId: assessment.id,
						grade: String(value),
					});
				} else {
					return updateGrade(gradeToUpdate.gradeId, {
						id: gradeToUpdate.gradeId,
						subjectAssessmentId: assessment.id,
						studentId,
						grade: String(value),
					});
				}
			});

			await Promise.all(promises);

			// Clear selection after successful save
			setSelectedRows([]);

			// Recalculate stats
			calculateStats();

			setIsLoading(false);
			showNotification(
				"success",
				`Grades saved for ${selectedRows.length} students`
			);
		} catch (err) {
			console.error("Error saving batch grades:", err);
			setIsLoading(false);
			showNotification("error", "Failed to save grades. Please try again.");
		}
	};

	// New functionality: Export grades to CSV
	const exportGrades = () => {
		// Create CSV content
		let csvContent = "Student Name,Grade\n";

		grades.forEach((grade) => {
			const studentGrade = localGrades[grade.studentId] || "";
			csvContent += `"${grade.studentName}",${studentGrade}\n`;
		});

		// Create download link
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", `${assessment.title}_grades.csv`);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		showNotification("success", "Grades exported successfully");
	};

	// Sort students
	const requestSort = (key) => {
		let direction = "asc";
		if (sortConfig.key === key && sortConfig.direction === "asc") {
			direction = "desc";
		}
		setSortConfig({ key, direction });
	};

	// Handle keyboard navigation
	const handleKeyDown = (e, studentId, index) => {
		if (e.key === "Enter") {
			saveGrade(studentId);
		} else if (e.key === "Escape") {
			// Cancel editing
			setEditing((prev) => ({ ...prev, [studentId]: false }));
			// Restore original grade
			const originalGrade =
				grades.find((g) => g.studentId === studentId)?.grade || "";
			setLocalGrades((prev) => ({ ...prev, [studentId]: originalGrade }));
		} else if (quickEditMode) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				moveFocusToNextStudent(studentId);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				moveFocusToPreviousStudent(studentId);
			}
		}
	};

	// Move focus to next student
	const moveFocusToNextStudent = (currentStudentId) => {
		const filteredStudents = getFilteredAndSortedGrades();
		const currentIndex = filteredStudents.findIndex(
			(g) => g.studentId === currentStudentId
		);

		if (currentIndex < filteredStudents.length - 1) {
			const nextStudent = filteredStudents[currentIndex + 1];
			setEditing((prev) => ({
				...prev,
				[currentStudentId]: false,
				[nextStudent.studentId]: true,
			}));

			// Wait for the input to be rendered and then focus it
			setTimeout(() => {
				if (inputRefs.current[nextStudent.studentId]) {
					inputRefs.current[nextStudent.studentId].focus();
				}
			}, 50);
		}
	};

	// Move focus to previous student
	const moveFocusToPreviousStudent = (currentStudentId) => {
		const filteredStudents = getFilteredAndSortedGrades();
		const currentIndex = filteredStudents.findIndex(
			(g) => g.studentId === currentStudentId
		);

		if (currentIndex > 0) {
			const prevStudent = filteredStudents[currentIndex - 1];
			setEditing((prev) => ({
				...prev,
				[currentStudentId]: false,
				[prevStudent.studentId]: true,
			}));

			// Wait for the input to be rendered and then focus it
			setTimeout(() => {
				if (inputRefs.current[prevStudent.studentId]) {
					inputRefs.current[prevStudent.studentId].focus();
				}
			}, 50);
		}
	};

	// Toggle selection of a student row
	const toggleRowSelection = (studentId) => {
		setSelectedRows((prev) => {
			if (prev.includes(studentId)) {
				return prev.filter((id) => id !== studentId);
			} else {
				return [...prev, studentId];
			}
		});
	};

	// Toggle selection of all visible students
	const toggleSelectAll = () => {
		const filteredStudents = getFilteredAndSortedGrades();

		if (selectedRows.length === filteredStudents.length) {
			// Deselect all
			setSelectedRows([]);
		} else {
			// Select all visible
			setSelectedRows(filteredStudents.map((g) => g.studentId));
		}
	};

	// Apply a quick grade to selected students
	const applyQuickGrade = (value) => {
		// If no students are selected, show notification
		if (selectedRows.length === 0) {
			showNotification("error", "No students selected");
			return;
		}

		// Convert to percentage if using percentage
		let gradeValue = value;
		if (value === "100%") {
			gradeValue = assessment.points.toString();
		} else if (value === "50%") {
			gradeValue = (Number(assessment.points) * 0.5).toString();
		} else if (value === "0%") {
			gradeValue = "0";
		}

		saveSelectedGrades(gradeValue);
	};

	// Enter quick edit mode for all students
	const enterQuickEditMode = () => {
		setQuickEditMode(true);
		const filteredStudents = getFilteredAndSortedGrades();

		if (filteredStudents.length > 0) {
			const firstStudentId = filteredStudents[0].studentId;
			setEditing({ [firstStudentId]: true });

			// Focus the first input after it's rendered
			setTimeout(() => {
				if (inputRefs.current[firstStudentId]) {
					inputRefs.current[firstStudentId].focus();
				}
			}, 50);
		}
	};

	// Exit quick edit mode
	const exitQuickEditMode = () => {
		setQuickEditMode(false);
		setEditing({});
	};

	// Toggle keyboard shortcuts modal
	const toggleKeyboardShortcuts = () => {
		setShowKeyboardShortcuts((prev) => !prev);
	};

	// Get filtered and sorted students
	const getFilteredAndSortedGrades = () => {
		// First apply search filter
		let result = grades.filter((grade) =>
			grade && grade.studentName
				? grade.studentName.toLowerCase().includes(searchTerm.toLowerCase())
				: false
		);

		// Then apply graded/ungraded filter
		if (filterMode === "graded") {
			result = result.filter(
				(grade) => grade.grade && grade.grade.trim() !== ""
			);
		} else if (filterMode === "ungraded") {
			result = result.filter(
				(grade) => !grade.grade || grade.grade.trim() === ""
			);
		}

		// Finally sort
		if (sortConfig.key) {
			result.sort((a, b) => {
				if (sortConfig.key === "studentName") {
					return sortConfig.direction === "asc"
						? a.studentName.localeCompare(b.studentName)
						: b.studentName.localeCompare(a.studentName);
				} else if (sortConfig.key === "grade") {
					const gradeA = parseFloat(localGrades[a.studentId] || 0);
					const gradeB = parseFloat(localGrades[b.studentId] || 0);

					// Handle empty grades (always at the bottom)
					const isEmptyA =
						!localGrades[a.studentId] || localGrades[a.studentId].trim() === "";
					const isEmptyB =
						!localGrades[b.studentId] || localGrades[b.studentId].trim() === "";

					if (isEmptyA && !isEmptyB) return 1;
					if (!isEmptyA && isEmptyB) return -1;

					return sortConfig.direction === "asc"
						? gradeA - gradeB
						: gradeB - gradeA;
				}
				return 0;
			});
		}

		return result;
	};

	// Calculate grade distribution data
	const getGradeDistribution = () => {
		const maxPoints = Number(assessment.points);
		const segments = 5; // Number of grade ranges
		const segmentSize = maxPoints / segments;

		// Initialize distribution with zeros
		const distribution = Array(segments).fill(0);

		// Count grades in each segment
		grades.forEach((grade) => {
			const gradeValue = parseFloat(localGrades[grade.studentId]);
			if (!isNaN(gradeValue)) {
				const segmentIndex = Math.min(
					Math.floor(gradeValue / segmentSize),
					segments - 1
				);
				distribution[segmentIndex]++;
			}
		});

		return distribution;
	};

	// Get filtered grades
	const filteredGrades = getFilteredAndSortedGrades();

	return (
		<div className="agm-modal-overlay">
			<div className="agm-modal-container">
				<div className="agm-modal-content">
					{/* Header */}
					<div className="agm-modal-header">
						<div className="agm-header-left">
							<h2 className="agm-title">
								{assessment.title}
								<span className="agm-subtitle">
									{assessment.type} • {assessment.points} points
								</span>
							</h2>
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

					{/* Loading indicator */}
					{isLoading && <div className="agm-loading-indicator"></div>}

					{/* Top section with search and filters */}
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

						<div className="agm-filter-actions">
							<div className="agm-filter-dropdown">
								<button className="agm-filter-button">
									<FontAwesomeIcon icon={faFilter} />
									<span>
										{filterMode === "all"
											? "All"
											: filterMode === "graded"
											? "Graded"
											: "Ungraded"}
									</span>
								</button>
								<div className="agm-filter-menu">
									<button
										className={`agm-filter-option ${
											filterMode === "all" ? "agm-active" : ""
										}`}
										onClick={() => setFilterMode("all")}
									>
										All Students
									</button>
									<button
										className={`agm-filter-option ${
											filterMode === "graded" ? "agm-active" : ""
										}`}
										onClick={() => setFilterMode("graded")}
									>
										Graded
									</button>
									<button
										className={`agm-filter-option ${
											filterMode === "ungraded" ? "agm-active" : ""
										}`}
										onClick={() => setFilterMode("ungraded")}
									>
										Ungraded
									</button>
								</div>
							</div>

							<button
								className={`agm-sort-button ${
									sortConfig.key === "studentName" ? "agm-active" : ""
								}`}
								onClick={() => requestSort("studentName")}
								title="Sort by name"
							>
								<FontAwesomeIcon
									icon={
										sortConfig.key === "studentName" &&
										sortConfig.direction === "desc"
											? faSortAmountDown
											: faSortAmountUp
									}
								/>
								<span>Name</span>
							</button>

							<button
								className={`agm-sort-button ${
									sortConfig.key === "grade" ? "agm-active" : ""
								}`}
								onClick={() => requestSort("grade")}
								title="Sort by grade"
							>
								<FontAwesomeIcon
									icon={
										sortConfig.key === "grade" &&
										sortConfig.direction === "desc"
											? faSortAmountDown
											: faSortAmountUp
									}
								/>
								<span>Grade</span>
							</button>
						</div>
					</div>

					{/* New: Batch Actions Bar */}
					<div className="agm-batch-actions">
						<div className="agm-batch-selection">
							<label className="agm-checkbox-container">
								<input
									type="checkbox"
									checked={
										selectedRows.length === filteredGrades.length &&
										filteredGrades.length > 0
									}
									onChange={toggleSelectAll}
								/>
								<span className="agm-checkbox-checkmark"></span>
								<span className="agm-checkbox-label">
									{selectedRows.length > 0
										? `${selectedRows.length} selected`
										: "Select All"}
								</span>
							</label>
						</div>

						<div className="agm-action-buttons">
							<button
								className="agm-action-button"
								disabled={selectedRows.length === 0}
								onClick={() => applyQuickGrade(assessment.points.toString())}
								title="Perfect score"
							>
								<FontAwesomeIcon icon={faCheckCircle} />
								<span>Full Points</span>
							</button>

							<button
								className="agm-action-button"
								disabled={selectedRows.length === 0}
								onClick={() =>
									applyQuickGrade((Number(assessment.points) * 0.5).toString())
								}
								title="Half points"
							>
								<FontAwesomeIcon icon={faPercentage} />
								<span>Half Points</span>
							</button>

							<button
								className="agm-action-button"
								disabled={selectedRows.length === 0}
								onClick={() => applyQuickGrade("0")}
								title="Zero points"
							>
								<FontAwesomeIcon icon={faExclamationCircle} />
								<span>Zero</span>
							</button>

							<div className="agm-custom-grade">
								<input
									type="text"
									className="agm-custom-grade-input"
									placeholder="Custom grade..."
									value={customGradeValue}
									onChange={(e) => {
										// Only allow numbers and decimal point
										const validGradeRegex = /^(\d*\.?\d*)$/;
										if (
											e.target.value === "" ||
											validGradeRegex.test(e.target.value)
										) {
											setCustomGradeValue(e.target.value);
										}
									}}
									disabled={selectedRows.length === 0}
								/>
								<button
									className="agm-custom-grade-button"
									disabled={
										selectedRows.length === 0 || customGradeValue === ""
									}
									onClick={() => {
										saveSelectedGrades(customGradeValue);
										setCustomGradeValue("");
									}}
									title="Apply custom grade"
								>
									Apply
								</button>
								<button
									className={`agm-quick-edit-button ${
										quickEditMode ? "agm-active" : ""
									}`}
									onClick={
										quickEditMode ? exitQuickEditMode : enterQuickEditMode
									}
									title="Quick edit mode"
								>
									<FontAwesomeIcon icon={faKeyboard} />
									<span>
										{quickEditMode ? "Exit Quick Edit" : "Quick Edit"}
									</span>
								</button>
							</div>
						</div>
					</div>

					{/* New: Keyboard Shortcuts Info Modal */}
					{showKeyboardShortcuts && (
						<div className="agm-keyboard-shortcuts">
							<div className="agm-shortcuts-header">
								<h3>Keyboard Shortcuts for Quick Edit</h3>
								<button onClick={toggleKeyboardShortcuts}>
									<FontAwesomeIcon icon={faTimes} />
								</button>
							</div>
							<div className="agm-shortcuts-content">
								<div className="agm-shortcut-item">
									<div className="agm-shortcut-key">↑ / ↓</div>
									<div className="agm-shortcut-desc">
										Navigate between students
									</div>
								</div>
								<div className="agm-shortcut-item">
									<div className="agm-shortcut-key">Enter</div>
									<div className="agm-shortcut-desc">
										Save grade and move to next student
									</div>
								</div>
								<div className="agm-shortcut-item">
									<div className="agm-shortcut-key">Esc</div>
									<div className="agm-shortcut-desc">Cancel editing</div>
								</div>
							</div>
						</div>
					)}

					{/* Student grades table */}
					<div className="agm-students-container">
						{filteredGrades.length > 0 ? (
							filteredGrades.map((grade, index) => (
								<div
									key={grade.studentId}
									className={`agm-student-row ${
										editing[grade.studentId] ? "agm-editing" : ""
									} ${
										selectedRows.includes(grade.studentId) ? "agm-selected" : ""
									}`}
								>
									<div className="agm-checkbox-column">
										<label className="agm-checkbox-container">
											<input
												type="checkbox"
												checked={selectedRows.includes(grade.studentId)}
												onChange={() => toggleRowSelection(grade.studentId)}
											/>
											<span className="agm-checkbox-checkmark"></span>
										</label>
									</div>

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
												onKeyDown={(e) =>
													handleKeyDown(e, grade.studentId, index)
												}
												ref={(el) => (inputRefs.current[grade.studentId] = el)}
												autoFocus
											/>
										) : (
											<span
												className={`agm-grade-display ${
													!localGrades[grade.studentId] ? "agm-not-graded" : ""
												}`}
												onClick={() => {
													if (quickEditMode) {
														setEditing((prev) => ({
															...prev,
															[grade.studentId]: true,
														}));
														setTimeout(() => {
															if (inputRefs.current[grade.studentId]) {
																inputRefs.current[grade.studentId].focus();
															}
														}, 50);
													}
												}}
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
						<button
							className="agm-shortcuts-button"
							onClick={toggleKeyboardShortcuts}
							title="Keyboard shortcuts"
						>
							<FontAwesomeIcon icon={faQuestionCircle} />
						</button>
						<div className="agm-footer-buttons">
							<button className="agm-cancel-btn" onClick={onClose}>
								Cancel
							</button>
							<button className="agm-close-btn" onClick={onClose}>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssessmentGradesModal;
