import React, {
	useEffect,
	useMemo,
	useState,
	useCallback,
	useRef,
} from "react";
import "./Grades.css";
import { useAuth, useGrades, useClassTeacher } from "../../../hooks";

const Grades = () => {
	const { user } = useAuth();
	const token = user?.token;

	// Use class teacher department ID
	const departmentId = useClassTeacher();

	// Hook to fetch grades
	const { grades, loading, error, fetchGradesByDepartment } = useGrades(token);

	// Selected subject
	const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);

	// Search term for filtering students
	const [searchTerm, setSearchTerm] = useState("");

	// Flag to track if data was loaded at least once
	const [initialLoadDone, setInitialLoadDone] = useState(false);

	// Print mode state
	const [printMode, setPrintMode] = useState(false);
	const [studentToPrint, setStudentToPrint] = useState(null);

	// Ref for print container
	const printContainerRef = useRef(null);

	// Fetch grades only once when the component mounts and tokens/department are available
	useEffect(() => {
		if (token && departmentId && !initialLoadDone) {
			fetchGradesByDepartment(departmentId);
			setInitialLoadDone(true);
		}
	}, [token, departmentId, initialLoadDone]); // Intentionally exclude fetchGradesByDepartment

	// Process data, correctly grouping by month and aggregating small assessments by type
	const processedData = useMemo(() => {
		if (!grades || !grades.length) return [];

		// Process each subject
		const subjectsWithGrades = grades
			.map((item) => {
				// Skip subjects with no assessments or grades
				if (!item.assessments || item.assessments.length === 0) return null;

				// Check if any assessment has grades
				const hasAnyGrades = item.assessments.some(
					(assess) => assess.grades && assess.grades.length > 0
				);

				// Skip subjects with no grades
				if (!hasAnyGrades) return null;

				// First, transform all assessments to include real dates
				const assessments = item.assessments.map((assess) => ({
					assessmentId: assess.assessmentId,
					title: assess.title,
					type: assess.type,
					pointsPossible: parseFloat(assess.points),
					assessmentDate: assess.assessmentDate
						? new Date(assess.assessmentDate)
						: null,
					originalGrades: assess.grades || [],
				}));

				// Group assessments by month
				const monthlyAssessments = {};
				assessments.forEach((assess) => {
					if (!assess.assessmentDate) return;

					const date = assess.assessmentDate;
					const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

					if (!monthlyAssessments[monthKey]) {
						monthlyAssessments[monthKey] = {
							year: date.getFullYear(),
							month: date.getMonth() + 1,
							displayName: date.toLocaleString("default", {
								month: "long",
								year: "numeric",
							}),
							smallAssessmentsByType: {}, // For assessments < 5 points
							largeAssessments: [], // For assessments >= 5 points
						};
					}

					// Group small assessments by type, keep large assessments as is
					if (assess.pointsPossible < 5) {
						const typeKey = assess.type;
						if (!monthlyAssessments[monthKey].smallAssessmentsByType[typeKey]) {
							monthlyAssessments[monthKey].smallAssessmentsByType[typeKey] = {
								type: typeKey,
								assessments: [],
								pointsPossible: 0,
							};
						}
						monthlyAssessments[monthKey].smallAssessmentsByType[
							typeKey
						].assessments.push(assess);
						monthlyAssessments[monthKey].smallAssessmentsByType[
							typeKey
						].pointsPossible += assess.pointsPossible;
					} else {
						monthlyAssessments[monthKey].largeAssessments.push(assess);
					}
				});

				// Convert to array and sort chronologically
				const monthsList = Object.values(monthlyAssessments).sort((a, b) => {
					if (a.year !== b.year) return a.year - b.year;
					return a.month - b.month;
				});

				// Build students with their grades
				const studentsMap = {};

				// Process each student's grades
				assessments.forEach((assess) => {
					assess.originalGrades.forEach((grade) => {
						const student = grade.student;
						const studentId = student.id;

						if (!studentsMap[studentId]) {
							studentsMap[studentId] = {
								studentId,
								firstName: student.firstName,
								lastName: student.lastName,
								grades: {},
								monthlyGrades: {},
							};
						}

						// Store original grade
						studentsMap[studentId].grades[assess.title] = parseFloat(
							grade.grade
						);

						// Also organize by month
						if (assess.assessmentDate) {
							const monthKey = `${assess.assessmentDate.getFullYear()}-${
								assess.assessmentDate.getMonth() + 1
							}`;

							if (!studentsMap[studentId].monthlyGrades[monthKey]) {
								studentsMap[studentId].monthlyGrades[monthKey] = {
									smallTypes: {},
									largeAssessments: {},
								};
							}

							// Store grade by type if small assessment
							if (assess.pointsPossible < 5) {
								const typeKey = assess.type;
								if (
									!studentsMap[studentId].monthlyGrades[monthKey].smallTypes[
										typeKey
									]
								) {
									studentsMap[studentId].monthlyGrades[monthKey].smallTypes[
										typeKey
									] = 0;
								}
								studentsMap[studentId].monthlyGrades[monthKey].smallTypes[
									typeKey
								] += parseFloat(grade.grade);
							} else {
								// Store large assessment grade directly
								studentsMap[studentId].monthlyGrades[monthKey].largeAssessments[
									assess.title
								] = parseFloat(grade.grade);
							}
						}
					});
				});

				// Only return if there are students with grades
				const students = Object.values(studentsMap);
				if (students.length === 0) return null;

				return {
					subjectName: item.subject.name,
					subjectCode: item.subject.id,
					originalAssessments: assessments,
					monthlyData: monthsList,
					students,
				};
			})
			.filter(Boolean); // Remove null entries (subjects with no grades)

		return subjectsWithGrades;
	}, [grades]);

	// Filter students based on search term - memoized to avoid recalculation
	const filteredStudents = useMemo(() => {
		if (!processedData.length || selectedSubjectIndex >= processedData.length)
			return [];

		const currentSubject = processedData[selectedSubjectIndex];
		if (!searchTerm.trim()) return currentSubject.students;

		const term = searchTerm.toLowerCase();
		return currentSubject.students.filter((student) =>
			`${student.firstName} ${student.lastName}`.toLowerCase().includes(term)
		);
	}, [processedData, selectedSubjectIndex, searchTerm]);

	// Reset selected subject index when data changes
	useEffect(() => {
		if (
			processedData.length > 0 &&
			selectedSubjectIndex >= processedData.length
		) {
			setSelectedSubjectIndex(0);
		}
	}, [processedData, selectedSubjectIndex]);

	// Handle subject change - use callback to prevent recreation on each render
	const handleSubjectChange = useCallback((e) => {
		setSelectedSubjectIndex(Number(e.target.value));
	}, []);

	// Print or export student grades
	const printStudentGrades = useCallback(
		(student) => {
			if (!processedData.length || selectedSubjectIndex >= processedData.length)
				return;

			// Set print mode and student to print
			setStudentToPrint(student);
			setPrintMode(true);

			// Use setTimeout to ensure the print view is rendered before printing
			setTimeout(() => {
				window.print();

				// Exit print mode after printing
				setTimeout(() => {
					setPrintMode(false);
					setStudentToPrint(null);
				}, 500);
			}, 300);
		},
		[processedData, selectedSubjectIndex]
	);

	// Calculate student's overall performance
	const calculateStudentOverall = useCallback((student, subject) => {
		let totalEarned = 0;
		let totalPossible = 0;

		// Calculate for each month
		subject.monthlyData.forEach((monthData) => {
			const monthKey = `${monthData.year}-${monthData.month}`;
			const studentMonthGrades = student.monthlyGrades[monthKey] || {
				smallTypes: {},
				largeAssessments: {},
			};

			let monthEarned = 0;
			let monthPossible = 0;

			// Add small assessments
			Object.entries(monthData.smallAssessmentsByType).forEach(
				([type, typeGroup]) => {
					const studentTypeGrade = studentMonthGrades.smallTypes[type] || 0;
					monthEarned += studentTypeGrade;
					monthPossible += typeGroup.pointsPossible;
				}
			);

			// Add large assessments
			monthData.largeAssessments.forEach((assess) => {
				const studentAssessGrade =
					studentMonthGrades.largeAssessments[assess.title];
				if (studentAssessGrade !== undefined) {
					monthEarned += studentAssessGrade;
					monthPossible += assess.pointsPossible;
				}
			});

			// Add to total
			totalEarned += monthEarned;
			totalPossible += monthPossible;
		});

		return {
			earned: totalEarned,
			possible: totalPossible,
			percentage:
				totalPossible > 0 ? (totalEarned / totalPossible) * 100 : null,
		};
	}, []);

	// Determine if we should show loading state
	const showLoading = loading && !grades.length;

	if (showLoading) {
		return (
			<div className="grade-sys-loading">
				<div className="grade-sys-spinner"></div>
				<p>Loading grades...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="grade-sys-error">
				<p>Error: {error.message || error.toString()}</p>
			</div>
		);
	}

	if (!processedData.length) {
		return (
			<div className="grade-sys-empty">
				<p>No grades available for this department.</p>
			</div>
		);
	}

	// Current subject
	const currentSubject = processedData[selectedSubjectIndex];

	// Print view for student grades
	if (printMode && studentToPrint) {
		const studentOverall = calculateStudentOverall(
			studentToPrint,
			currentSubject
		);

		return (
			<div className="grade-sys-print-container" ref={printContainerRef}>
				<div className="grade-sys-print-header">
					<h1>Student Grade Report</h1>
					<h2>
						{studentToPrint.firstName} {studentToPrint.lastName}
					</h2>
					<div className="grade-sys-print-meta">
						<p>
							<strong>Subject:</strong> {currentSubject.subjectName}
						</p>
						<p>
							<strong>Date:</strong> {new Date().toLocaleDateString()}
						</p>
					</div>
				</div>

				{/* Only show months with grades */}
				{currentSubject.monthlyData
					.filter((monthData) => {
						const monthKey = `${monthData.year}-${monthData.month}`;
						const studentMonthGrades = studentToPrint.monthlyGrades[
							monthKey
						] || { smallTypes: {}, largeAssessments: {} };
						return (
							Object.keys(studentMonthGrades.smallTypes).length > 0 ||
							Object.keys(studentMonthGrades.largeAssessments).length > 0
						);
					})
					.map((monthData) => {
						const monthKey = `${monthData.year}-${monthData.month}`;
						const studentMonthGrades = studentToPrint.monthlyGrades[
							monthKey
						] || { smallTypes: {}, largeAssessments: {} };

						// Calculate month total
						let monthEarned = 0;
						let monthPossible = 0;

						return (
							<div className="grade-sys-print-month" key={monthKey}>
								<h3>{monthData.displayName}</h3>
								<table className="grade-sys-print-table">
									<thead>
										<tr>
											<th>Assessment</th>
											<th>Score</th>
											<th>Possible</th>
											<th>Percentage</th>
										</tr>
									</thead>
									<tbody>
										{/* Small assessments grouped by type */}
										{Object.entries(monthData.smallAssessmentsByType).map(
											([type, typeGroup]) => {
												const typeGrade =
													studentMonthGrades.smallTypes[type] || 0;
												monthEarned += typeGrade;
												monthPossible += typeGroup.pointsPossible;

												const typePercentage =
													typeGroup.pointsPossible > 0
														? (typeGrade / typeGroup.pointsPossible) * 100
														: null;

												return (
													<tr key={type}>
														<td>{type}</td>
														<td>{typeGrade.toFixed(1)}</td>
														<td>{typeGroup.pointsPossible.toFixed(1)}</td>
														<td>
															{typePercentage !== null
																? `${typePercentage.toFixed(1)}%`
																: "-"}
														</td>
													</tr>
												);
											}
										)}

										{/* Large assessments individually */}
										{monthData.largeAssessments.map((assess) => {
											const grade =
												studentMonthGrades.largeAssessments[assess.title];
											const hasGrade = grade !== undefined;

											if (hasGrade) {
												monthEarned += grade;
												monthPossible += assess.pointsPossible;

												const assessPercentage =
													(grade / assess.pointsPossible) * 100;

												return (
													<tr key={assess.assessmentId}>
														<td>
															{assess.title} ({assess.type})
														</td>
														<td>{grade.toFixed(1)}</td>
														<td>{assess.pointsPossible.toFixed(1)}</td>
														<td>{assessPercentage.toFixed(1)}%</td>
													</tr>
												);
											}

											return null;
										})}

										{/* Month total */}
										{monthPossible > 0 && (
											<tr className="grade-sys-print-total">
												<td>
													<strong>Month Total</strong>
												</td>
												<td>
													<strong>{monthEarned.toFixed(1)}</strong>
												</td>
												<td>
													<strong>{monthPossible.toFixed(1)}</strong>
												</td>
												<td>
													<strong>
														{((monthEarned / monthPossible) * 100).toFixed(1)}%
													</strong>
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						);
					})}

				{/* Final summary */}
				{studentOverall.possible > 0 && (
					<div className="grade-sys-print-summary">
						<h3>Overall Performance</h3>
						<table className="grade-sys-print-table">
							<thead>
								<tr>
									<th>Total Earned</th>
									<th>Total Possible</th>
									<th>Final Percentage</th>
								</tr>
							</thead>
							<tbody>
								<tr className="grade-sys-print-final">
									<td>
										<strong>{studentOverall.earned.toFixed(1)}</strong>
									</td>
									<td>
										<strong>{studentOverall.possible.toFixed(1)}</strong>
									</td>
									<td>
										<strong>
											{studentOverall.percentage !== null
												? `${studentOverall.percentage.toFixed(1)}%`
												: "-"}
										</strong>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}
			</div>
		);
	}

	// Normal view
	return (
		<div className="grade-sys-wrapper">
			<div className="grade-sys-header">
				<div className="grade-sys-subject-control">
					<select
						className="grade-sys-subject-select"
						value={selectedSubjectIndex}
						onChange={handleSubjectChange}
					>
						{processedData.map((subject, index) => (
							<option key={subject.subjectCode} value={index}>
								{subject.subjectName}
							</option>
						))}
					</select>
				</div>

				<div className="grade-sys-info">
					<div className="grade-sys-stat">
						<span className="grade-sys-stat-label">Students:</span>
						<span className="grade-sys-stat-value">
							{currentSubject.students.length}
						</span>
					</div>
					<div className="grade-sys-stat">
						<span className="grade-sys-stat-label">Months:</span>
						<span className="grade-sys-stat-value">
							{currentSubject.monthlyData.length}
						</span>
					</div>
				</div>

				<div className="grade-sys-search">
					<input
						type="text"
						placeholder="Search students..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{/* Display months */}
			{currentSubject.monthlyData.map((monthData) => (
				<div
					key={`${monthData.year}-${monthData.month}`}
					className="grade-sys-month-card"
				>
					<div className="grade-sys-month-header">
						<h3>{monthData.displayName}</h3>
					</div>

					<div className="grade-sys-table-container">
						<table className="grade-sys-table">
							<thead>
								<tr>
									<th className="grade-sys-student-col">Student</th>

									{/* Small assessments grouped by type */}
									{Object.values(monthData.smallAssessmentsByType).map(
										(typeGroup) => (
											<th key={typeGroup.type} className="grade-sys-type-col">
												<div className="grade-sys-type-name">
													{typeGroup.type}
												</div>
												<div className="grade-sys-type-points">
													{typeGroup.pointsPossible.toFixed(1)} pts
												</div>
											</th>
										)
									)}

									{/* Large assessments individually */}
									{monthData.largeAssessments.map((assess) => (
										<th
											key={assess.assessmentId}
											className="grade-sys-assess-col"
										>
											<div className="grade-sys-assess-title">
												{assess.title}
											</div>
											<div className="grade-sys-assess-points">
												{assess.pointsPossible} pts
											</div>
											<div className="grade-sys-assess-type">{assess.type}</div>
										</th>
									))}

									<th className="grade-sys-month-total-col">Month Total</th>
								</tr>
							</thead>
							<tbody>
								{filteredStudents.map((student) => {
									const monthKey = `${monthData.year}-${monthData.month}`;
									const studentMonthGrades = student.monthlyGrades[
										monthKey
									] || { smallTypes: {}, largeAssessments: {} };

									// Calculate month total
									let monthEarned = 0;
									let monthPossible = 0;

									// Add up small assessments by type
									Object.entries(monthData.smallAssessmentsByType).forEach(
										([type, typeGroup]) => {
											const studentTypeGrade =
												studentMonthGrades.smallTypes[type] || 0;
											monthEarned += studentTypeGrade;
											monthPossible += typeGroup.pointsPossible;
										}
									);

									// Add up large assessments
									monthData.largeAssessments.forEach((assess) => {
										const studentAssessGrade =
											studentMonthGrades.largeAssessments[assess.title];
										if (studentAssessGrade !== undefined) {
											monthEarned += studentAssessGrade;
											monthPossible += assess.pointsPossible;
										}
									});

									const monthPercentage =
										monthPossible > 0
											? (monthEarned / monthPossible) * 100
											: null;

									return (
										<tr key={student.studentId}>
											<td className="grade-sys-student-name">
												{student.firstName} {student.lastName}
											</td>

											{/* Small assessments grouped by type */}
											{Object.entries(monthData.smallAssessmentsByType).map(
												([type, typeGroup]) => {
													const typeGrade = studentMonthGrades.smallTypes[type];
													const hasGrade = typeGrade !== undefined;

													return (
														<td
															key={type}
															className={`grade-sys-type-grade ${
																!hasGrade ? "grade-sys-missing" : ""
															}`}
														>
															{hasGrade ? typeGrade.toFixed(1) : "—"}
														</td>
													);
												}
											)}

											{/* Large assessments individually */}
											{monthData.largeAssessments.map((assess) => {
												const grade =
													studentMonthGrades.largeAssessments[assess.title];
												const hasGrade = grade !== undefined;

												return (
													<td
														key={assess.assessmentId}
														className={`grade-sys-assess-grade ${
															!hasGrade ? "grade-sys-missing" : ""
														}`}
													>
														{hasGrade ? grade.toFixed(1) : "—"}
													</td>
												);
											})}

											<td className="grade-sys-month-total">
												{monthPossible > 0 ? (
													<>
														<div className="grade-sys-month-score">
															{monthEarned.toFixed(1)}/
															{monthPossible.toFixed(1)}
														</div>
														{monthPercentage !== null && (
															<div className="grade-sys-month-percent">
																{monthPercentage.toFixed(1)}%
															</div>
														)}
													</>
												) : (
													<span className="grade-sys-no-grade">—</span>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			))}

			{/* Overall summary section with print option */}
			<div className="grade-sys-summary-card">
				<div className="grade-sys-summary-header">
					<h3>Overall Performance</h3>
				</div>
				<div className="grade-sys-table-container">
					<table className="grade-sys-table">
						<thead>
							<tr>
								<th className="grade-sys-student-col">Student</th>
								{currentSubject.monthlyData.map((monthData) => (
									<th
										key={`${monthData.year}-${monthData.month}`}
										className="grade-sys-month-col"
									>
										{new Date(
											monthData.year,
											monthData.month - 1
										).toLocaleString("default", { month: "short" })}
									</th>
								))}
								<th className="grade-sys-final-col">Final</th>
								<th className="grade-sys-export-col">Export</th>
							</tr>
						</thead>
						<tbody>
							{filteredStudents.map((student) => {
								const studentOverall = calculateStudentOverall(
									student,
									currentSubject
								);

								// Calculate for each month for the visualization
								const monthlyScores = currentSubject.monthlyData.map(
									(monthData) => {
										const monthKey = `${monthData.year}-${monthData.month}`;
										const studentMonthGrades = student.monthlyGrades[
											monthKey
										] || { smallTypes: {}, largeAssessments: {} };

										let monthEarned = 0;
										let monthPossible = 0;

										// Add small assessments
										Object.entries(monthData.smallAssessmentsByType).forEach(
											([type, typeGroup]) => {
												const studentTypeGrade =
													studentMonthGrades.smallTypes[type] || 0;
												monthEarned += studentTypeGrade;
												monthPossible += typeGroup.pointsPossible;
											}
										);

										// Add large assessments
										monthData.largeAssessments.forEach((assess) => {
											const studentAssessGrade =
												studentMonthGrades.largeAssessments[assess.title];
											if (studentAssessGrade !== undefined) {
												monthEarned += studentAssessGrade;
												monthPossible += assess.pointsPossible;
											}
										});

										return {
											earned: monthEarned,
											possible: monthPossible,
											percentage:
												monthPossible > 0
													? (monthEarned / monthPossible) * 100
													: null,
										};
									}
								);

								return (
									<tr key={student.studentId}>
										<td className="grade-sys-student-name">
											{student.firstName} {student.lastName}
										</td>

										{monthlyScores.map((score, index) => {
											const monthData = currentSubject.monthlyData[index];
											const hasScore = score.percentage !== null;

											return (
												<td
													key={`${monthData.year}-${monthData.month}`}
													className="grade-sys-month-summary"
												>
													{hasScore ? (
														<div
															className="grade-sys-month-circle"
															style={{
																backgroundColor: getGradientColor(
																	score.percentage
																),
															}}
														>
															{score.percentage.toFixed(0)}%
														</div>
													) : (
														<span className="grade-sys-no-data">—</span>
													)}
												</td>
											);
										})}

										<td className="grade-sys-final-grade">
											{studentOverall.percentage !== null ? (
												<div className="grade-sys-final-score">
													<div className="grade-sys-final-percent">
														{studentOverall.percentage.toFixed(1)}%
													</div>
													<div className="grade-sys-final-raw">
														{studentOverall.earned.toFixed(1)}/
														{studentOverall.possible.toFixed(1)}
													</div>
												</div>
											) : (
												<span className="grade-sys-no-data">No Data</span>
											)}
										</td>

										{/* Print button */}
										<td className="grade-sys-export-cell">
											<button
												className="grade-sys-export-btn"
												onClick={() => printStudentGrades(student)}
												title="Print Report"
											>
												<span className="grade-sys-export-icon">🖨️</span>
												Print
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

// Helper function to generate color based on percentage
const getGradientColor = (percent) => {
	if (percent >= 90) return "#4ade80"; // Green
	if (percent >= 80) return "#22d3ee"; // Cyan
	if (percent >= 70) return "#60a5fa"; // Blue
	if (percent >= 60) return "#f59e0b"; // Amber
	return "#ef4444"; // Red
};

export default Grades;
