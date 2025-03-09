import React, { useState, useEffect } from "react";
import "./ClassGradesPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faGraduationCap,
	faUser,
	faChevronRight,
	faFilter,
	faSearch,
	faEye,
	faFileExport,
	faChartBar,
	faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

const ClassGradesPage = () => {
	// State for active tab
	const [activeTab, setActiveTab] = useState("bySubject");

	// State for selected filters
	const [selectedSubject, setSelectedSubject] = useState(1);
	const [selectedStudent, setSelectedStudent] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");

	// Mock data - in a real app, this would come from an API
	const [students] = useState([
		{ id: 1, name: "Alex Johnson" },
		{ id: 2, name: "Taylor Smith" },
		{ id: 3, name: "Jordan Lee" },
		{ id: 4, name: "Casey Brown" },
		{ id: 5, name: "Morgan Wilson" },
	]);

	const [subjects] = useState([
		{ id: 1, name: "Mathematics" },
		{ id: 2, name: "Science" },
		{ id: 3, name: "English" },
		{ id: 4, name: "History" },
		{ id: 5, name: "Art" },
	]);

	const [assessments] = useState([
		{ id: 1, subjectId: 1, name: "Midterm Exam", maxPoints: 30 },
		{ id: 2, subjectId: 1, name: "Final Exam", maxPoints: 40 },
		{ id: 3, subjectId: 1, name: "Homework", maxPoints: 15 },
		{ id: 4, subjectId: 1, name: "Class Participation", maxPoints: 15 },
		{ id: 5, subjectId: 2, name: "Lab Report", maxPoints: 25 },
		{ id: 6, subjectId: 2, name: "Midterm Exam", maxPoints: 30 },
		{ id: 7, subjectId: 2, name: "Final Exam", maxPoints: 35 },
		{ id: 8, subjectId: 2, name: "Project", maxPoints: 10 },
		{ id: 9, subjectId: 3, name: "Essay", maxPoints: 25 },
		{ id: 10, subjectId: 3, name: "Presentation", maxPoints: 20 },
		{ id: 11, subjectId: 3, name: "Midterm Exam", maxPoints: 25 },
		{ id: 12, subjectId: 3, name: "Final Exam", maxPoints: 30 },
		{ id: 13, subjectId: 4, name: "Research Paper", maxPoints: 30 },
		{ id: 14, subjectId: 4, name: "Midterm Exam", maxPoints: 30 },
		{ id: 15, subjectId: 4, name: "Final Exam", maxPoints: 30 },
		{ id: 16, subjectId: 4, name: "Participation", maxPoints: 10 },
		{ id: 17, subjectId: 5, name: "Portfolio", maxPoints: 50 },
		{ id: 18, subjectId: 5, name: "Project", maxPoints: 30 },
		{ id: 19, subjectId: 5, name: "Participation", maxPoints: 20 },
	]);

	// Generate random grades for demo
	const [grades] = useState(
		students.flatMap((student) =>
			assessments.map((assessment) => ({
				id: `${student.id}-${assessment.id}`,
				studentId: student.id,
				assessmentId: assessment.id,
				subjectId: assessment.subjectId,
				points: Math.floor(Math.random() * (assessment.maxPoints + 1)),
			}))
		)
	);

	// Filter students based on search query
	const filteredStudents = students.filter((student) =>
		student.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Calculate total points per subject
	const calculateTotalPoints = (studentId, subjectId) => {
		const studentGrades = grades.filter(
			(grade) => grade.studentId === studentId && grade.subjectId === subjectId
		);

		return studentGrades.reduce((total, grade) => total + grade.points, 0);
	};

	// Calculate max points possible per subject
	const calculateMaxPoints = (subjectId) => {
		const subjectAssessments = assessments.filter(
			(assessment) => assessment.subjectId === subjectId
		);

		return subjectAssessments.reduce(
			(total, assessment) => total + assessment.maxPoints,
			0
		);
	};

	// Calculate percentage
	const calculatePercentage = (studentId, subjectId) => {
		const totalPoints = calculateTotalPoints(studentId, subjectId);
		const maxPoints = calculateMaxPoints(subjectId);
		return Math.round((totalPoints / maxPoints) * 100);
	};

	// Get grade letter based on percentage
	const getGradeLetter = (percentage) => {
		if (percentage >= 90) return "A";
		if (percentage >= 80) return "B";
		if (percentage >= 70) return "C";
		if (percentage >= 60) return "D";
		return "F";
	};

	// Get color based on percentage for visual feedback
	const getGradeColor = (percentage) => {
		if (percentage >= 90) return "var(--cgp-grade-a)";
		if (percentage >= 80) return "var(--cgp-grade-b)";
		if (percentage >= 70) return "var(--cgp-grade-c)";
		if (percentage >= 60) return "var(--cgp-grade-d)";
		return "var(--cgp-grade-f)";
	};

	// Render content by subject
	const renderSubjectView = () => {
		const subject = subjects.find((s) => s.id === selectedSubject);
		const subjectAssessments = assessments.filter(
			(assessment) => assessment.subjectId === selectedSubject
		);

		return (
			<div className="cgp-grades-panel">
				<div className="cgp-panel-header">
					<h3>{subject.name} Grades</h3>
					<div className="cgp-panel-actions">
						<button className="cgp-action-button">
							<FontAwesomeIcon icon={faFileExport} />
							<span>Export</span>
						</button>
						<button className="cgp-action-button">
							<FontAwesomeIcon icon={faChartBar} />
							<span>Analytics</span>
						</button>
					</div>
				</div>

				<div className="cgp-table-container">
					<table className="cgp-grades-table">
						<thead>
							<tr>
								<th className="cgp-student-col">Student</th>
								{subjectAssessments.map((assessment) => (
									<th key={assessment.id} className="cgp-assessment-col">
										{assessment.name}
										<span className="cgp-max-points">
											Max: {assessment.maxPoints} pts
										</span>
									</th>
								))}
								<th className="cgp-total-col">Total</th>
								<th className="cgp-grade-col">Grade</th>
							</tr>
						</thead>
						<tbody>
							{filteredStudents.map((student) => {
								const percentage = calculatePercentage(
									student.id,
									selectedSubject
								);
								return (
									<tr key={student.id}>
										<td className="cgp-student-name">{student.name}</td>
										{subjectAssessments.map((assessment) => {
											const grade = grades.find(
												(g) =>
													g.studentId === student.id &&
													g.assessmentId === assessment.id
											);
											const points = grade ? grade.points : 0;
											const percentage = Math.round(
												(points / assessment.maxPoints) * 100
											);

											return (
												<td key={assessment.id} className="cgp-assessment-cell">
													<div className="cgp-points">
														{points}/{assessment.maxPoints}
													</div>
													<div
														className="cgp-progress-bar"
														style={{
															width: `${percentage}%`,
															backgroundColor: getGradeColor(percentage),
														}}
													></div>
												</td>
											);
										})}
										<td className="cgp-total-cell">
											<strong>
												{calculateTotalPoints(student.id, selectedSubject)}/
												{calculateMaxPoints(selectedSubject)}
											</strong>
										</td>
										<td>
											<span
												className="cgp-grade-pill"
												style={{ backgroundColor: getGradeColor(percentage) }}
											>
												{getGradeLetter(percentage)} ({percentage}%)
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				<div className="cgp-panel-footer">
					<div className="cgp-grade-legend">
						<div className="cgp-legend-item">
							<span
								className="cgp-legend-color"
								style={{ backgroundColor: "var(--cgp-grade-a)" }}
							></span>
							<span>A (90-100%)</span>
						</div>
						<div className="cgp-legend-item">
							<span
								className="cgp-legend-color"
								style={{ backgroundColor: "var(--cgp-grade-b)" }}
							></span>
							<span>B (80-89%)</span>
						</div>
						<div className="cgp-legend-item">
							<span
								className="cgp-legend-color"
								style={{ backgroundColor: "var(--cgp-grade-c)" }}
							></span>
							<span>C (70-79%)</span>
						</div>
						<div className="cgp-legend-item">
							<span
								className="cgp-legend-color"
								style={{ backgroundColor: "var(--cgp-grade-d)" }}
							></span>
							<span>D (60-69%)</span>
						</div>
						<div className="cgp-legend-item">
							<span
								className="cgp-legend-color"
								style={{ backgroundColor: "var(--cgp-grade-f)" }}
							></span>
							<span>F (0-59%)</span>
						</div>
					</div>
				</div>
			</div>
		);
	};

	// Render content by student
	const renderStudentView = () => {
		const student = students.find((s) => s.id === selectedStudent);

		return (
			<div className="cgp-grades-panel">
				<div className="cgp-panel-header">
					<h3>{student.name}'s Grades</h3>
					<div className="cgp-panel-actions">
						<button className="cgp-action-button">
							<FontAwesomeIcon icon={faFileExport} />
							<span>Export</span>
						</button>
						<button className="cgp-action-button">
							<FontAwesomeIcon icon={faEye} />
							<span>Student View</span>
						</button>
					</div>
				</div>

				<div className="cgp-table-container">
					<table className="cgp-grades-table cgp-student-grades-table">
						<thead>
							<tr>
								<th>Subject</th>
								<th>Assessments</th>
								<th>Total</th>
								<th>Grade</th>
							</tr>
						</thead>
						<tbody>
							{subjects.map((subject) => {
								const subjectAssessments = assessments.filter(
									(assessment) => assessment.subjectId === subject.id
								);
								const percentage = calculatePercentage(
									selectedStudent,
									subject.id
								);

								return (
									<tr key={subject.id}>
										<td className="cgp-subject-name">{subject.name}</td>
										<td>
											<div className="cgp-assessment-list">
												{subjectAssessments.map((assessment) => {
													const grade = grades.find(
														(g) =>
															g.studentId === selectedStudent &&
															g.assessmentId === assessment.id
													);
													const points = grade ? grade.points : 0;
													const assessmentPercentage = Math.round(
														(points / assessment.maxPoints) * 100
													);

													return (
														<div
															key={assessment.id}
															className="cgp-assessment-item"
														>
															<div className="cgp-assessment-details">
																<span className="cgp-assessment-name">
																	{assessment.name}
																</span>
																<span className="cgp-assessment-grade">
																	{points}/{assessment.maxPoints}
																</span>
															</div>
															<div className="cgp-assessment-progress-container">
																<div
																	className="cgp-assessment-progress"
																	style={{
																		width: `${assessmentPercentage}%`,
																		backgroundColor:
																			getGradeColor(assessmentPercentage),
																	}}
																></div>
															</div>
														</div>
													);
												})}
											</div>
										</td>
										<td className="cgp-total-cell">
											<strong>
												{calculateTotalPoints(selectedStudent, subject.id)}/
												{calculateMaxPoints(subject.id)}
											</strong>
										</td>
										<td>
											<span
												className="cgp-grade-pill"
												style={{ backgroundColor: getGradeColor(percentage) }}
											>
												{getGradeLetter(percentage)} ({percentage}%)
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	// Render summary stats
	const renderSummaryView = () => {
		// Calculate overall averages for each subject
		const subjectAverages = subjects.map((subject) => {
			const average =
				students.reduce((total, student) => {
					return total + calculatePercentage(student.id, subject.id);
				}, 0) / students.length;

			return {
				...subject,
				average: Math.round(average),
				letterGrade: getGradeLetter(average),
			};
		});

		// Get top and bottom performers
		const studentAverages = students
			.map((student) => {
				const totalPercentage = subjects.reduce((total, subject) => {
					return total + calculatePercentage(student.id, subject.id);
				}, 0);

				const average = totalPercentage / subjects.length;

				return {
					...student,
					average: Math.round(average),
				};
			})
			.sort((a, b) => b.average - a.average);

		const topPerformers = studentAverages.slice(0, 3);
		const lowPerformers = [...studentAverages]
			.sort((a, b) => a.average - b.average)
			.slice(0, 3);

		return (
			// summary page
			<div className="cgp-summary-view">
				<div className="cgp-summary-section">
					<h3>Subject Performance</h3>
					<div className="cgp-subject-performance">
						{subjectAverages.map((subject) => (
							<div key={subject.id} className="cgp-performance-card">
								<div className="cgp-card-header">
									<h4>{subject.name}</h4>
								</div>
								<div className="cgp-card-content">
									<div
										className="cgp-grade-circle"
										style={{
											background: `conic-gradient(${getGradeColor(
												subject.average
											)} ${subject.average}%, #e0e0e0 0)`,
										}}
									>
										<span className="cgp-grade-text">
											{subject.letterGrade}
										</span>
										<span className="cgp-grade-percentage">
											{subject.average}%
										</span>
									</div>
									<div className="cgp-performance-details">
										<div className="cgp-detail-item">
											<span className="cgp-detail-label">Class Average</span>
											<span className="cgp-detail-value">
												{subject.average}%
											</span>
										</div>
										<div className="cgp-detail-item">
											<span className="cgp-detail-label">Highest Score</span>
											<span className="cgp-detail-value">
												{Math.max(
													...students.map((s) =>
														calculatePercentage(s.id, subject.id)
													)
												)}
												%
											</span>
										</div>
										<div className="cgp-detail-item">
											<span className="cgp-detail-label">Lowest Score</span>
											<span className="cgp-detail-value">
												{Math.min(
													...students.map((s) =>
														calculatePercentage(s.id, subject.id)
													)
												)}
												%
											</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="cgp-summary-columns">
					<div className="cgp-summary-column">
						<h3>Top Performers</h3>
						<div className="cgp-performers-list">
							{topPerformers.map((student, index) => (
								<div key={student.id} className="cgp-performer-card">
									<div className="cgp-performer-rank">{index + 1}</div>
									<div className="cgp-performer-info">
										<div className="cgp-performer-name">{student.name}</div>
										<div className="cgp-performer-grade">
											{student.average}% Average
										</div>
									</div>
									<div
										className="cgp-performer-grade-pill"
										style={{ backgroundColor: getGradeColor(student.average) }}
									>
										{getGradeLetter(student.average)}
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="cgp-summary-column">
						<h3>Needs Improvement</h3>
						<div className="cgp-performers-list">
							{lowPerformers.map((student, index) => (
								<div key={student.id} className="cgp-performer-card">
									<div className="cgp-performer-info">
										<div className="cgp-performer-name">{student.name}</div>
										<div className="cgp-performer-grade">
											{student.average}% Average
										</div>
									</div>
									<div
										className="cgp-performer-grade-pill"
										style={{ backgroundColor: getGradeColor(student.average) }}
									>
										{getGradeLetter(student.average)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		// left sidebar
		<div className="cgp-class-grades-page">
			<div className="cgp-main-container">
				<div className="cgp-sidebar">
					<div className="cgp-class-info">
						<h2>Class 10-B</h2>
						<div className="cgp-class-meta">
							<div className="cgp-meta-item">
								<span className="cgp-meta-label">Students</span>
								<span className="cgp-meta-value">{students.length}</span>
							</div>
							<div className="cgp-meta-item">
								<span className="cgp-meta-label">Subjects</span>
								<span className="cgp-meta-value">{subjects.length}</span>
							</div>
						</div>
					</div>

					<nav className="cgp-tab-navigation">
						<button
							className={`cgp-nav-item ${
								activeTab === "bySubject" ? "active" : ""
							}`}
							onClick={() => setActiveTab("bySubject")}
						>
							<span className="cgp-nav-icon">
								<FontAwesomeIcon icon={faGraduationCap} />
							</span>
							<span className="cgp-nav-text">View by Subject</span>
							{activeTab === "bySubject" && (
								<FontAwesomeIcon
									icon={faChevronRight}
									className="cgp-indicator"
								/>
							)}
						</button>

						<button
							className={`cgp-nav-item ${
								activeTab === "byStudent" ? "active" : ""
							}`}
							onClick={() => setActiveTab("byStudent")}
						>
							<span className="cgp-nav-icon">
								<FontAwesomeIcon icon={faUser} />
							</span>
							<span className="cgp-nav-text">View by Student</span>
							{activeTab === "byStudent" && (
								<FontAwesomeIcon
									icon={faChevronRight}
									className="cgp-indicator"
								/>
							)}
						</button>

						<button
							className={`cgp-nav-item ${
								activeTab === "summary" ? "active" : ""
							}`}
							onClick={() => setActiveTab("summary")}
						>
							<span className="cgp-nav-icon">
								<FontAwesomeIcon icon={faChartBar} />
							</span>
							<span className="cgp-nav-text">Class Summary</span>
							{activeTab === "summary" && (
								<FontAwesomeIcon
									icon={faChevronRight}
									className="cgp-indicator"
								/>
							)}
						</button>
					</nav>

					<div className="cgp-filter-section">
						<h3>
							<FontAwesomeIcon icon={faFilter} className="cgp-filter-icon" />
							Filters
						</h3>

						{activeTab === "bySubject" && (
							<div className="cgp-filter-content">
								<div className="cgp-filter-group">
									<label htmlFor="subject-select">Subject</label>
									<select
										id="subject-select"
										value={selectedSubject}
										onChange={(e) => setSelectedSubject(Number(e.target.value))}
									>
										{subjects.map((subject) => (
											<option key={subject.id} value={subject.id}>
												{subject.name}
											</option>
										))}
									</select>
								</div>

								<div className="cgp-filter-group">
									<label htmlFor="student-search">Search Student</label>
									<div className="cgp-search-input">
										<input
											type="text"
											id="student-search"
											placeholder="Search by name..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
										<FontAwesomeIcon
											icon={faSearch}
											className="cgp-search-icon"
										/>
									</div>
								</div>
							</div>
						)}

						{activeTab === "byStudent" && (
							<div className="cgp-filter-content">
								<div className="cgp-filter-group">
									<label htmlFor="student-select">Student</label>
									<select
										id="student-select"
										value={selectedStudent}
										onChange={(e) => setSelectedStudent(Number(e.target.value))}
									>
										{students.map((student) => (
											<option key={student.id} value={student.id}>
												{student.name}
											</option>
										))}
									</select>
								</div>
							</div>
						)}
					</div>

					<div className="cgp-info-card">
						<div className="cgp-info-card-header">
							<FontAwesomeIcon icon={faInfoCircle} className="cgp-info-icon" />
							<h3>Need Help?</h3>
						</div>
						<p>
							Use the class grade management system to view, analyze, and export
							student performance data.
						</p>
						<button className="cgp-help-button">View Tutorial</button>
					</div>
				</div>

				<div className="cgp-content-area">
					{activeTab === "bySubject" && renderSubjectView()}
					{activeTab === "byStudent" && renderStudentView()}
					{activeTab === "summary" && renderSummaryView()}
				</div>
			</div>
		</div>
	);
};

export default ClassGradesPage;
