import React, {
	useEffect,
	useMemo,
	useState,
	useCallback,
	useRef,
} from "react";
import "./Grades.css";
import { useAuth, useGrades, useClassTeacher } from "../../../hooks";
import { useLanguage } from "../../../contexts/LanguageContext"; // Added language context

const Grades = () => {
	const { user } = useAuth();
	const token = user?.token;
	const { t, language } = useLanguage(); // Added language hook

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
						// Get month display name with proper localization
						const monthLocale =
							language === "ar"
								? "ar-SA"
								: language === "bs"
								? "bs-BA"
								: "en-US";

						monthlyAssessments[monthKey] = {
							year: date.getFullYear(),
							month: date.getMonth() + 1,
							displayName: date.toLocaleString(monthLocale, {
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
	}, [grades, language]); // Added language dependency

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

	// Find a student across all subjects by ID
	const findStudentById = useCallback(
		(studentId) => {
			// First check in the current subject
			for (const subject of processedData) {
				const foundStudent = subject.students.find(
					(s) => s.studentId === studentId
				);
				if (foundStudent) {
					return foundStudent;
				}
			}
			return null;
		},
		[processedData]
	);

	// Format numbers according to locale
	const formatNumber = (num, precision = 1) => {
		if (num === null || num === undefined) return "";

		// Arabic uses different numerals
		if (language === "ar") {
			const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
			return num
				.toFixed(precision)
				.toString()
				.split("")
				.map((char) => {
					return char === "."
						? "٫" // Arabic decimal separator
						: !isNaN(parseInt(char))
						? arabicNumerals[parseInt(char)]
						: char;
				})
				.join("");
		}

		// For other languages use standard formatting
		return num.toFixed(precision);
	};

	// Format percentage according to locale
	const formatPercentage = (percent, precision = 1) => {
		if (percent === null || percent === undefined) return "";

		// Format the number
		const formattedNumber = formatNumber(percent, precision);

		// Add appropriate percentage symbol and direction
		return language === "ar" ? `٪${formattedNumber}` : `${formattedNumber}%`;
	};

	// Print all grades for a student
	const printStudentGrades = useCallback(
		(student) => {
			if (!processedData.length) return;

			// Find the student in all subjects to ensure we have the complete data
			const studentWithAllData = findStudentById(student.studentId);
			if (!studentWithAllData) return;

			// Set print mode and student to print
			setStudentToPrint(studentWithAllData);
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
		[processedData, findStudentById]
	);

	// Calculate student's overall performance for a subject
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
				<p>{t("grades.loading")}</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="grade-sys-error">
				<p>
					{t("grades.error")}: {error.message || error.toString()}
				</p>
			</div>
		);
	}

	if (!processedData.length) {
		return (
			<div className="grade-sys-empty">
				<p>{t("grades.noGradesAvailable")}</p>
			</div>
		);
	}

	// Print view for comprehensive student grades report
	if (printMode && studentToPrint) {
		// Calculate aggregate totals across all subjects
		let totalEarnedAll = 0;
		let totalPossibleAll = 0;

		// Use appropriate date locale
		const dateLocale =
			language === "ar" ? "ar-SA" : language === "bs" ? "bs-BA" : "en-US";

		return (
			<div className="grade-sys-print-container" ref={printContainerRef}>
				<div className="grade-sys-print-header">
					<h1>{t("grades.studentGradeReport")}</h1>
					<h2>
						{studentToPrint.firstName} {studentToPrint.lastName}
					</h2>
					<div className="grade-sys-print-meta">
						<p>
							<strong>{t("grades.reportDate")}:</strong>{" "}
							{new Date().toLocaleDateString(dateLocale)}
						</p>
					</div>
				</div>

				{/* Loop through all subjects */}
				{processedData.map((subject) => {
					// Find the student in this subject
					const studentInSubject = subject.students.find(
						(s) => s.studentId === studentToPrint.studentId
					);

					// Skip subjects where the student doesn't have grades
					if (!studentInSubject) return null;

					// Calculate student's overall performance for this subject
					const subjectOverall = calculateStudentOverall(
						studentInSubject,
						subject
					);

					// Add to aggregate totals
					if (subjectOverall.possible > 0) {
						totalEarnedAll += subjectOverall.earned;
						totalPossibleAll += subjectOverall.possible;
					}

					return (
						<div className="grade-sys-print-subject" key={subject.subjectCode}>
							<h2 className="grade-sys-print-subject-title">
								{subject.subjectName}
							</h2>

							{/* Display months for this subject */}
							{subject.monthlyData.map((monthData) => {
								const monthKey = `${monthData.year}-${monthData.month}`;
								const studentMonthGrades = studentInSubject.monthlyGrades[
									monthKey
								] || { smallTypes: {}, largeAssessments: {} };

								// Calculate month total
								let monthEarned = 0;
								let monthPossible = 0;

								// Check if student has any grades for this month
								const hasAnyGrades =
									Object.keys(studentMonthGrades.smallTypes).length > 0 ||
									Object.keys(studentMonthGrades.largeAssessments).length > 0;

								if (!hasAnyGrades) return null;

								return (
									<div className="grade-sys-print-month" key={monthKey}>
										<h3>{monthData.displayName}</h3>
										<table className="grade-sys-print-table">
											<thead>
												<tr>
													<th>{t("grades.assessment")}</th>
													<th>{t("grades.score")}</th>
													<th>{t("grades.possible")}</th>
													<th>{t("grades.percentage")}</th>
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
																<td>
																	{t(
																		`grades.assessmentTypes.${type.toLowerCase()}`
																	) || type}
																</td>
																<td>{formatNumber(typeGrade)}</td>
																<td>
																	{formatNumber(typeGroup.pointsPossible)}
																</td>
																<td>
																	{typePercentage !== null
																		? formatPercentage(typePercentage)
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
																	{assess.title} (
																	{t(
																		`grades.assessmentTypes.${assess.type.toLowerCase()}`
																	) || assess.type}
																	)
																</td>
																<td>{formatNumber(grade)}</td>
																<td>{formatNumber(assess.pointsPossible)}</td>
																<td>{formatPercentage(assessPercentage)}</td>
															</tr>
														);
													}

													return null;
												})}

												{/* Month total */}
												{monthPossible > 0 && (
													<tr className="grade-sys-print-total">
														<td>
															<strong>{t("grades.monthTotal")}</strong>
														</td>
														<td>
															<strong>{formatNumber(monthEarned)}</strong>
														</td>
														<td>
															<strong>{formatNumber(monthPossible)}</strong>
														</td>
														<td>
															<strong>
																{formatPercentage(
																	(monthEarned / monthPossible) * 100
																)}
															</strong>
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								);
							})}

							{/* Subject summary */}
							{subjectOverall.possible > 0 && (
								<div className="grade-sys-print-subject-summary">
									<table className="grade-sys-print-table">
										<thead>
											<tr>
												<th colSpan="3">
													{subject.subjectName} -{" "}
													{t("grades.overallPerformance")}
												</th>
											</tr>
											<tr>
												<th>{t("grades.totalEarned")}</th>
												<th>{t("grades.totalPossible")}</th>
												<th>{t("grades.finalPercentage")}</th>
											</tr>
										</thead>
										<tbody>
											<tr className="grade-sys-print-subject-final">
												<td>{formatNumber(subjectOverall.earned)}</td>
												<td>{formatNumber(subjectOverall.possible)}</td>
												<td>{formatPercentage(subjectOverall.percentage)}</td>
											</tr>
										</tbody>
									</table>
								</div>
							)}
						</div>
					);
				})}

				{/* Final summary across all subjects */}
				{totalPossibleAll > 0 && (
					<div className="grade-sys-print-summary">
						<h2>{t("grades.overallAcademicPerformance")}</h2>
						<table className="grade-sys-print-table">
							<thead>
								<tr>
									<th>{t("grades.totalEarnedAllSubjects")}</th>
									<th>{t("grades.totalPossibleAllSubjects")}</th>
									<th>{t("grades.finalAverage")}</th>
								</tr>
							</thead>
							<tbody>
								<tr className="grade-sys-print-final">
									<td>
										<strong>{formatNumber(totalEarnedAll)}</strong>
									</td>
									<td>
										<strong>{formatNumber(totalPossibleAll)}</strong>
									</td>
									<td>
										<strong>
											{formatPercentage(
												(totalEarnedAll / totalPossibleAll) * 100
											)}
										</strong>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}

				<div className="grade-sys-print-footer">
					<p>{t("grades.endOfReport")}</p>
				</div>
			</div>
		);
	}

	// Current subject for regular view
	const currentSubject = processedData[selectedSubjectIndex];

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
						<span className="grade-sys-stat-label">
							{t("grades.students")}:
						</span>
						<span className="grade-sys-stat-value">
							{currentSubject.students.length}
						</span>
					</div>
					<div className="grade-sys-stat">
						<span className="grade-sys-stat-label">{t("grades.months")}:</span>
						<span className="grade-sys-stat-value">
							{currentSubject.monthlyData.length}
						</span>
					</div>
				</div>

				<div className="grade-sys-search">
					<input
						type="text"
						placeholder={t("grades.searchStudents")}
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
									<th className="grade-sys-student-col">
										{t("grades.student")}
									</th>

									{/* Small assessments grouped by type */}
									{Object.values(monthData.smallAssessmentsByType).map(
										(typeGroup) => (
											<th key={typeGroup.type} className="grade-sys-type-col">
												<div className="grade-sys-type-name">
													{t(
														`grades.assessmentTypes.${typeGroup.type.toLowerCase()}`
													) || typeGroup.type}
												</div>
												<div className="grade-sys-type-points">
													{formatNumber(typeGroup.pointsPossible)}{" "}
													{t("grades.pts")}
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
												{formatNumber(assess.pointsPossible)} {t("grades.pts")}
											</div>
											<div className="grade-sys-assess-type">
												{t(
													`grades.assessmentTypes.${assess.type.toLowerCase()}`
												) || assess.type}
											</div>
										</th>
									))}

									<th className="grade-sys-month-total-col">
										{t("grades.monthTotal")}
									</th>
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
															{hasGrade ? formatNumber(typeGrade) : "—"}
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
														{hasGrade ? formatNumber(grade) : "—"}
													</td>
												);
											})}

											<td className="grade-sys-month-total">
												{monthPossible > 0 ? (
													<>
														<div className="grade-sys-month-score">
															{formatNumber(monthEarned)}/
															{formatNumber(monthPossible)}
														</div>
														{monthPercentage !== null && (
															<div className="grade-sys-month-percent">
																{formatPercentage(monthPercentage)}
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
					<h3>{t("grades.overallPerformance")}</h3>
				</div>
				<div className="grade-sys-table-container">
					<table className="grade-sys-table">
						<thead>
							<tr>
								<th className="grade-sys-student-col">{t("grades.student")}</th>
								{currentSubject.monthlyData.map((monthData) => {
									// Get appropriate month name based on locale
									const monthLocale =
										language === "ar"
											? "ar-SA"
											: language === "bs"
											? "bs-BA"
											: "en-US";
									const monthName = new Date(
										monthData.year,
										monthData.month - 1
									).toLocaleString(monthLocale, { month: "short" });

									return (
										<th
											key={`${monthData.year}-${monthData.month}`}
											className="grade-sys-month-col"
										>
											{monthName}
										</th>
									);
								})}
								<th className="grade-sys-final-col">{t("grades.final")}</th>
								<th className="grade-sys-export-col">{t("grades.report")}</th>
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
															{formatNumber(score.percentage, 0)}
															{language === "ar" ? "٪" : "%"}
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
														{formatPercentage(studentOverall.percentage)}
													</div>
													<div className="grade-sys-final-raw">
														{formatNumber(studentOverall.earned)}/
														{formatNumber(studentOverall.possible)}
													</div>
												</div>
											) : (
												<span className="grade-sys-no-data">
													{t("grades.noData")}
												</span>
											)}
										</td>

										{/* Print button */}
										<td className="grade-sys-export-cell">
											<button
												className="grade-sys-export-btn"
												onClick={() => printStudentGrades(student)}
												title={t("grades.printCompleteReport")}
											>
												<span className="grade-sys-export-icon">🖨️</span>
												{t("grades.print")}
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
