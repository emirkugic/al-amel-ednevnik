import React, { useState, useEffect, useRef } from "react";
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
	faSortAmountDown,
	faSortAmountUp,
	faKeyboard,
	faPercentage,
	faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./AssessmentGradesModal.css";
import useGrades from "../../../../hooks/useGrades";

const AssessmentGradesModal = ({ assessment, token, onClose }) => {
	// ================= REFS & DOM ACCESS =================
	// Use refs to bypass the React re-rendering system for updates
	const studentRowsRef = useRef({});
	const gradeDisplaysRef = useRef({});
	const inputRefs = useRef({});
	const initialLoadCompleteRef = useRef(false);

	// ================= DATA STATE =================
	// We'll keep a master list of students that never changes order
	const [originalStudentList, setOriginalStudentList] = useState([]);
	const [gradeValues, setGradeValues] = useState({});

	// ================= UI STATE =================
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterMode, setFilterMode] = useState("all");
	const [sortConfig, setSortConfig] = useState({
		key: "studentName",
		direction: "asc",
	});
	const [stats, setStats] = useState({
		average: 0,
		highest: 0,
		lowest: 0,
		graded: 0,
		ungraded: 0,
	});
	const [selectedRows, setSelectedRows] = useState([]);
	const [editingRow, setEditingRow] = useState(null);
	const [quickEditMode, setQuickEditMode] = useState(false);
	const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
	const [customGradeValue, setCustomGradeValue] = useState("");

	// ================= DATA FETCHING =================
	const { grades, fetchGrades, updateGrade, createGrade } = useGrades(token);

	// Fetch grades on mount - only once
	useEffect(() => {
		if (!assessment || !token) return;

		let isMounted = true;
		setIsLoading(true);

		fetchGrades(assessment.id)
			.then(() => {
				if (isMounted) {
					setIsLoading(false);
					initialLoadCompleteRef.current = true;
				}
			})
			.catch((err) => {
				console.error("Error fetching grades:", err);
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [assessment.id, token]);

	// When grades arrive from API, process them once - we'll maintain our own state after this
	useEffect(() => {
		if (grades.length > 0 && originalStudentList.length === 0) {
			// Create a stable master list of students that will never change order
			setOriginalStudentList(
				grades.map((grade) => ({
					studentId: grade.studentId,
					studentName: grade.studentName,
					gradeId: grade.gradeId,
				}))
			);

			// Create a map of grades by student ID
			const gradeMap = {};
			grades.forEach((grade) => {
				gradeMap[grade.studentId] = grade.grade;
			});
			setGradeValues(gradeMap);

			// Calculate initial stats
			calculateStats(gradeMap);
		}
	}, [grades]);

	// Calculate statistics from the grade values
	const calculateStats = (gradeData) => {
		const values = Object.values(gradeData)
			.filter((g) => g !== "0")
			.map((g) => parseFloat(g));
		const graded = values.length;
		const ungraded = Object.keys(gradeData).length - graded;

		if (values.length > 0) {
			const sum = values.reduce((a, b) => a + b, 0);
			const average = sum / values.length;
			const highest = Math.max(...values);
			const lowest = Math.min(...values);

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
	};

	// ================= GRADE OPERATIONS =================
	// Handle grade input change
	const handleGradeChange = (studentId, value) => {
		// Empty string is treated as "0" (ungraded)
		if (value === "") {
			value = "0";
		}

		// Validate grade format (number or decimal)
		const validGradeRegex = /^(\d*\.?\d*)$/;
		if (!validGradeRegex.test(value)) {
			return;
		}

		// Validate grade range
		const numericGrade = parseFloat(value);
		if (
			numericGrade < 0 ||
			(numericGrade > Number(assessment.points) && value !== "0")
		) {
			return;
		}

		// Update our local state
		setGradeValues((prev) => ({
			...prev,
			[studentId]: value,
		}));
	};

	const saveGrade = async (studentId) => {
		// Get the current grade value
		const gradeValue = gradeValues[studentId];

		// Don't save if the grade is invalid
		if (gradeValue !== "0") {
			const numericGrade = parseFloat(gradeValue);
			if (
				isNaN(numericGrade) ||
				numericGrade < 0 ||
				numericGrade > Number(assessment.points)
			) {
				return;
			}
		}

		// Find the student in our master list
		const student = originalStudentList.find((s) => s.studentId === studentId);
		if (!student) return;

		// Exit editing mode immediately (don't wait for API response)
		setEditingRow(null);

		// Directly update the display in the DOM for immediate feedback
		if (gradeDisplaysRef.current[studentId]) {
			// Update directly in the DOM
			const display = gradeDisplaysRef.current[studentId];
			display.textContent = gradeValue === "0" ? "Not Graded" : gradeValue;
			display.className = `agm-grade-display ${
				gradeValue === "0" ? "agm-not-graded" : ""
			}`;
		}

		try {
			// Call the API to persist the change
			if (!student.gradeId) {
				// Create a new grade
				await createGrade({
					studentId,
					subjectAssessmentId: assessment.id,
					grade: gradeValue,
				});

				// Update our master list with the new grade ID when returned
				setOriginalStudentList((prev) =>
					prev.map((s) =>
						s.studentId === studentId ? { ...s, gradeId: "pending" } : s
					)
				);
			} else {
				await updateGrade(student.gradeId, {
					id: student.gradeId, // Must include ID in body to match URL parameter
					subjectAssessmentId: assessment.id,
					studentId,
					grade: gradeValue,
					date: new Date(), // Include the date field as required by the model
				});
			}

			// Recalculate stats after saving
			calculateStats(gradeValues);

			// If in quick edit mode, move to next student
			if (quickEditMode) {
				moveToNextStudent(studentId);
			}
		} catch (err) {
			console.error("Error saving grade:", err);
			alert("Failed to save grade");
		}
	};

	// Save grades for multiple selected students
	const saveSelectedGrades = async (value) => {
		if (selectedRows.length === 0) {
			alert("No students selected");
			return;
		}

		// Validate grade
		const numericValue = parseFloat(value);
		if (
			value !== "0" &&
			(isNaN(numericValue) ||
				numericValue < 0 ||
				numericValue > Number(assessment.points))
		) {
			alert(`Grade must be between 0 and ${assessment.points}`);
			return;
		}

		// Update the UI immediately for all selected students
		const updatedGrades = { ...gradeValues };
		selectedRows.forEach((studentId) => {
			updatedGrades[studentId] = value;

			// Update DOM directly for immediate feedback
			if (gradeDisplaysRef.current[studentId]) {
				const display = gradeDisplaysRef.current[studentId];
				display.textContent = value === "0" ? "Not Graded" : value;
				display.className = `agm-grade-display ${
					value === "0" ? "agm-not-graded" : ""
				}`;
			}
		});

		// Update our state
		setGradeValues(updatedGrades);

		try {
			// Process the API calls for each student
			setIsLoading(true);
			const promises = selectedRows.map((studentId) => {
				const student = originalStudentList.find(
					(s) => s.studentId === studentId
				);
				if (!student) return Promise.resolve();

				if (!student.gradeId) {
					return createGrade({
						studentId,
						subjectAssessmentId: assessment.id,
						grade: value,
					});
				} else {
					return updateGrade(student.gradeId, {
						id: student.gradeId,
						subjectAssessmentId: assessment.id,
						studentId,
						grade: value,
					});
				}
			});

			await Promise.all(promises);

			// Clear selection
			setSelectedRows([]);

			// Update stats
			calculateStats(updatedGrades);

			setIsLoading(false);
		} catch (err) {
			console.error("Error saving batch grades:", err);
			setIsLoading(false);
		}
	};

	// ================= KEYBOARD NAVIGATION =================
	const handleKeyDown = (e, studentId) => {
		if (e.key === "Enter") {
			saveGrade(studentId);
		} else if (e.key === "Escape") {
			// Cancel editing
			setEditingRow(null);
		} else if (quickEditMode) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				moveToNextStudent(studentId);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				moveToPreviousStudent(studentId);
			}
		}
	};

	// Move to next student in quick edit mode
	const moveToNextStudent = (currentStudentId) => {
		const filteredStudents = getVisibleStudents();
		const currentIndex = filteredStudents.findIndex(
			(s) => s.studentId === currentStudentId
		);

		if (currentIndex < filteredStudents.length - 1) {
			const nextStudent = filteredStudents[currentIndex + 1];
			setEditingRow(nextStudent.studentId);

			// Focus the input after React has updated the DOM
			setTimeout(() => {
				if (inputRefs.current[nextStudent.studentId]) {
					inputRefs.current[nextStudent.studentId].focus();
				}
			}, 50);
		}
	};

	// Move to previous student in quick edit mode
	const moveToPreviousStudent = (currentStudentId) => {
		const filteredStudents = getVisibleStudents();
		const currentIndex = filteredStudents.findIndex(
			(s) => s.studentId === currentStudentId
		);

		if (currentIndex > 0) {
			const prevStudent = filteredStudents[currentIndex - 1];
			setEditingRow(prevStudent.studentId);

			// Focus the input after React has updated the DOM
			setTimeout(() => {
				if (inputRefs.current[prevStudent.studentId]) {
					inputRefs.current[prevStudent.studentId].focus();
				}
			}, 50);
		}
	};

	// ================= FILTERING & SORTING =================
	// Get the list of students that should be visible based on filters and sorting
	const getVisibleStudents = () => {
		if (originalStudentList.length === 0) return [];

		// First apply search filter
		let filtered = originalStudentList;
		if (searchTerm) {
			filtered = filtered.filter((student) =>
				student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Then apply graded/ungraded filter
		if (filterMode === "graded") {
			filtered = filtered.filter(
				(student) => gradeValues[student.studentId] !== "0"
			);
		} else if (filterMode === "ungraded") {
			filtered = filtered.filter(
				(student) => gradeValues[student.studentId] === "0"
			);
		}

		// Create a copy of the filtered list for sorting
		const sorted = [...filtered];

		// Apply sorting
		if (sortConfig.key) {
			sorted.sort((a, b) => {
				if (sortConfig.key === "studentName") {
					const result = a.studentName.localeCompare(b.studentName);
					return sortConfig.direction === "asc" ? result : -result;
				} else if (sortConfig.key === "grade") {
					const gradeA = gradeValues[a.studentId] || "0";
					const gradeB = gradeValues[b.studentId] || "0";

					// Handle "Not Graded" ("0") values
					if (gradeA === "0" && gradeB !== "0") return 1;
					if (gradeA !== "0" && gradeB === "0") return -1;

					// Compare numeric values
					const numA = gradeA === "0" ? 0 : parseFloat(gradeA);
					const numB = gradeB === "0" ? 0 : parseFloat(gradeB);

					return sortConfig.direction === "asc" ? numA - numB : numB - numA;
				}
				return 0;
			});
		}

		return sorted;
	};

	// Request a change in sort direction
	const requestSort = (key) => {
		let direction = "asc";
		if (sortConfig.key === key && sortConfig.direction === "asc") {
			direction = "desc";
		}
		setSortConfig({ key, direction });
	};

	// ================= ROW SELECTION =================
	// Toggle selection for a single student
	const toggleSelection = (studentId) => {
		setSelectedRows((prev) => {
			if (prev.includes(studentId)) {
				return prev.filter((id) => id !== studentId);
			} else {
				return [...prev, studentId];
			}
		});
	};

	// Toggle selection for all visible students
	const toggleSelectAll = () => {
		const visibleStudents = getVisibleStudents();
		const visibleIds = visibleStudents.map((s) => s.studentId);

		if (selectedRows.length === visibleIds.length) {
			// Deselect all
			setSelectedRows([]);
		} else {
			// Select all visible
			setSelectedRows(visibleIds);
		}
	};

	// Apply a quick grade to all selected students
	const applyQuickGrade = (value) => {
		if (selectedRows.length === 0) {
			return;
		}

		// Convert to points based on assessment
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

	// Enter quick edit mode
	const enterQuickEditMode = () => {
		setQuickEditMode(true);
		const visibleStudents = getVisibleStudents();
		if (visibleStudents.length > 0) {
			setEditingRow(visibleStudents[0].studentId);

			// Focus the first input
			setTimeout(() => {
				if (inputRefs.current[visibleStudents[0].studentId]) {
					inputRefs.current[visibleStudents[0].studentId].focus();
				}
			}, 50);
		}
	};

	// Exit quick edit mode
	const exitQuickEditMode = () => {
		setQuickEditMode(false);
		setEditingRow(null);
	};

	// Toggle keyboard shortcuts modal
	const toggleKeyboardShortcuts = () => {
		setShowKeyboardShortcuts((prev) => !prev);
	};

	// Calculate which students should be visible
	const visibleStudents = getVisibleStudents();

	return (
		<div className="agm-modal-overlay">
			<div className="agm-modal-container">
				<div className="agm-modal-content">
					{/* ==================== HEADER ==================== */}
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
									{stats.graded}/{originalStudentList.length}
								</div>
								<div className="agm-stat-label">Graded</div>
							</div>
						</div>
					</div>

					{/* ==================== LOADING INDICATOR ==================== */}
					{isLoading && !initialLoadCompleteRef.current && (
						<div className="agm-loading-indicator"></div>
					)}

					{/* ==================== TOP SECTION ==================== */}
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

					{/* ==================== BATCH ACTIONS ==================== */}
					<div className="agm-batch-actions">
						<div className="agm-batch-selection">
							<label className="agm-checkbox-container">
								<input
									type="checkbox"
									checked={
										selectedRows.length === visibleStudents.length &&
										visibleStudents.length > 0
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

					{/* ==================== KEYBOARD SHORTCUTS ==================== */}
					{showKeyboardShortcuts && (
						<div className="agm-keyboard-shortcuts">
							<div className="agm-shortcuts-header">
								<h3>Keyboard Shortcuts</h3>
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

					{/* ==================== STUDENT LIST ==================== */}
					<div className="agm-students-container">
						{visibleStudents.length > 0 ? (
							visibleStudents.map((student, index) => {
								const { studentId, studentName } = student;
								const isEditing = editingRow === studentId;
								const isSelected = selectedRows.includes(studentId);
								const gradeValue = gradeValues[studentId] || "0";
								const isUngraded = gradeValue === "0";

								return (
									<div
										key={studentId}
										className={`agm-student-row ${
											isEditing ? "agm-editing" : ""
										} ${isSelected ? "agm-selected" : ""}`}
										ref={(el) => (studentRowsRef.current[studentId] = el)}
									>
										<div className="agm-checkbox-column">
											<label className="agm-checkbox-container">
												<input
													type="checkbox"
													checked={isSelected}
													onChange={() => toggleSelection(studentId)}
												/>
												<span className="agm-checkbox-checkmark"></span>
											</label>
										</div>

										<div className="agm-student-name">{studentName}</div>

										<div className="agm-student-grade">
											{isEditing ? (
												<input
													type="text"
													className="agm-grade-input"
													value={isUngraded ? "" : gradeValue}
													onChange={(e) =>
														handleGradeChange(studentId, e.target.value)
													}
													onKeyDown={(e) => handleKeyDown(e, studentId)}
													ref={(el) => (inputRefs.current[studentId] = el)}
													autoFocus
												/>
											) : (
												<span
													className={`agm-grade-display ${
														isUngraded ? "agm-not-graded" : ""
													}`}
													onClick={() => {
														if (quickEditMode) {
															setEditingRow(studentId);
															setTimeout(() => {
																if (inputRefs.current[studentId]) {
																	inputRefs.current[studentId].focus();
																}
															}, 50);
														}
													}}
													ref={(el) =>
														(gradeDisplaysRef.current[studentId] = el)
													}
												>
													{isUngraded ? "Not Graded" : gradeValue}
												</span>
											)}
										</div>

										<div className="agm-student-actions">
											{isEditing ? (
												<button
													onClick={() => saveGrade(studentId)}
													className="agm-button agm-save-button"
													title="Save grade"
												>
													<FontAwesomeIcon icon={faSave} />
													<span>Save</span>
												</button>
											) : (
												<button
													onClick={() => setEditingRow(studentId)}
													className="agm-button agm-edit-button"
													title="Edit grade"
												>
													<FontAwesomeIcon icon={faPen} />
													<span>Edit</span>
												</button>
											)}
										</div>
									</div>
								);
							})
						) : (
							<div className="agm-no-results">
								<p>No students found matching your search criteria.</p>
							</div>
						)}
					</div>

					{/* ==================== FOOTER ==================== */}
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
								Done
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssessmentGradesModal;
