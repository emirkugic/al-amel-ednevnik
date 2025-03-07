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
		if (percentage >= 90) return "var(--grade-a)";
		if (percentage >= 80) return "var(--grade-b)";
		if (percentage >= 70) return "var(--grade-c)";
		if (percentage >= 60) return "var(--grade-d)";
		return "var(--grade-f)";
	};

	// Render content by subject
	const renderSubjectView = () => {
		const subject = subjects.find((s) => s.id === selectedSubject);
		const subjectAssessments = assessments.filter(
			(assessment) => assessment.subjectId === selectedSubject
		);

		return (
			<div className="grades-panel">
				<div className="panel-header">
					<h3>{subject.name} Grades</h3>
					<div className="panel-actions">
						<button className="action-button">
							<FontAwesomeIcon icon={faFileExport} />
							<span>Export</span>
						</button>
						<button className="action-button">
							<FontAwesomeIcon icon={faChartBar} />
							<span>Analytics</span>
						</button>
					</div>
				</div>

				<div className="table-container">
					<table className="grades-table">
						<thead>
							<tr>
								<th className="student-col">Student</th>
								{subjectAssessments.map((assessment) => (
									<th key={assessment.id} className="assessment-col">
										{assessment.name}
										<span className="max-points">
											Max: {assessment.maxPoints} pts
										</span>
									</th>
								))}
								<th className="total-col">Total</th>
								<th className="grade-col">Grade</th>
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
										<td className="student-name">{student.name}</td>
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
												<td key={assessment.id} className="assessment-cell">
													<div className="points">
														{points}/{assessment.maxPoints}
													</div>
													<div
														className="progress-bar"
														style={{
															width: `${percentage}%`,
															backgroundColor: getGradeColor(percentage),
														}}
													></div>
												</td>
											);
										})}
										<td className="total-cell">
											<strong>
												{calculateTotalPoints(student.id, selectedSubject)}/
												{calculateMaxPoints(selectedSubject)}
											</strong>
										</td>
										<td>
											<span
												className="grade-pill"
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

				<div className="panel-footer">
					<div className="grade-legend">
						<div className="legend-item">
							<span
								className="legend-color"
								style={{ backgroundColor: "var(--grade-a)" }}
							></span>
							<span>A (90-100%)</span>
						</div>
						<div className="legend-item">
							<span
								className="legend-color"
								style={{ backgroundColor: "var(--grade-b)" }}
							></span>
							<span>B (80-89%)</span>
						</div>
						<div className="legend-item">
							<span
								className="legend-color"
								style={{ backgroundColor: "var(--grade-c)" }}
							></span>
							<span>C (70-79%)</span>
						</div>
						<div className="legend-item">
							<span
								className="legend-color"
								style={{ backgroundColor: "var(--grade-d)" }}
							></span>
							<span>D (60-69%)</span>
						</div>
						<div className="legend-item">
							<span
								className="legend-color"
								style={{ backgroundColor: "var(--grade-f)" }}
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
			<div className="grades-panel">
				<div className="panel-header">
					<h3>{student.name}'s Grades</h3>
					<div className="panel-actions">
						<button className="action-button">
							<FontAwesomeIcon icon={faFileExport} />
							<span>Export</span>
						</button>
						<button className="action-button">
							<FontAwesomeIcon icon={faEye} />
							<span>Student View</span>
						</button>
					</div>
				</div>

				<div className="table-container">
					<table className="grades-table student-grades-table">
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
										<td className="subject-name">{subject.name}</td>
										<td>
											<div className="assessment-list">
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
															className="assessment-item"
														>
															<div className="assessment-details">
																<span className="assessment-name">
																	{assessment.name}
																</span>
																<span className="assessment-grade">
																	{points}/{assessment.maxPoints}
																</span>
															</div>
															<div className="assessment-progress-container">
																<div
																	className="assessment-progress"
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
										<td className="total-cell">
											<strong>
												{calculateTotalPoints(selectedStudent, subject.id)}/
												{calculateMaxPoints(subject.id)}
											</strong>
										</td>
										<td>
											<span
												className="grade-pill"
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
			<div className="summary-view">
				<div className="summary-section">
					<h3>Subject Performance</h3>
					<div className="subject-performance">
						{subjectAverages.map((subject) => (
							<div key={subject.id} className="performance-card">
								<div className="card-header">
									<h4>{subject.name}</h4>
								</div>
								<div className="card-content">
									<div
										className="grade-circle"
										style={{
											background: `conic-gradient(${getGradeColor(
												subject.average
											)} ${subject.average}%, #e0e0e0 0)`,
										}}
									>
										<span className="grade-text">{subject.letterGrade}</span>
										<span className="grade-percentage">{subject.average}%</span>
									</div>
									<div className="performance-details">
										<div className="detail-item">
											<span className="detail-label">Class Average</span>
											<span className="detail-value">{subject.average}%</span>
										</div>
										<div className="detail-item">
											<span className="detail-label">Highest Score</span>
											<span className="detail-value">
												{Math.max(
													...students.map((s) =>
														calculatePercentage(s.id, subject.id)
													)
												)}
												%
											</span>
										</div>
										<div className="detail-item">
											<span className="detail-label">Lowest Score</span>
											<span className="detail-value">
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

				<div className="summary-columns">
					<div className="summary-column">
						<h3>Top Performers</h3>
						<div className="performers-list">
							{topPerformers.map((student, index) => (
								<div key={student.id} className="performer-card">
									<div className="performer-rank">{index + 1}</div>
									<div className="performer-info">
										<div className="performer-name">{student.name}</div>
										<div className="performer-grade">
											{student.average}% Average
										</div>
									</div>
									<div
										className="performer-grade-pill"
										style={{ backgroundColor: getGradeColor(student.average) }}
									>
										{getGradeLetter(student.average)}
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="summary-column">
						<h3>Needs Improvement</h3>
						<div className="performers-list">
							{lowPerformers.map((student, index) => (
								<div key={student.id} className="performer-card">
									<div className="performer-info">
										<div className="performer-name">{student.name}</div>
										<div className="performer-grade">
											{student.average}% Average
										</div>
									</div>
									<div
										className="performer-grade-pill"
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
		<div className="class-grades-page">
			<div className="main-container">
				<div className="sidebar">
					<div className="class-info">
						<h2>Class 10-B</h2>
						<div className="class-meta">
							<div className="meta-item">
								<span className="meta-label">Students</span>
								<span className="meta-value">{students.length}</span>
							</div>
							<div className="meta-item">
								<span className="meta-label">Subjects</span>
								<span className="meta-value">{subjects.length}</span>
							</div>
						</div>
					</div>

					<nav className="tab-navigation">
						<button
							className={`nav-item ${
								activeTab === "bySubject" ? "active" : ""
							}`}
							onClick={() => setActiveTab("bySubject")}
						>
							<span className="nav-icon">
								<FontAwesomeIcon icon={faGraduationCap} />
							</span>
							<span className="nav-text">View by Subject</span>
							{activeTab === "bySubject" && (
								<FontAwesomeIcon icon={faChevronRight} className="indicator" />
							)}
						</button>

						<button
							className={`nav-item ${
								activeTab === "byStudent" ? "active" : ""
							}`}
							onClick={() => setActiveTab("byStudent")}
						>
							<span className="nav-icon">
								<FontAwesomeIcon icon={faUser} />
							</span>
							<span className="nav-text">View by Student</span>
							{activeTab === "byStudent" && (
								<FontAwesomeIcon icon={faChevronRight} className="indicator" />
							)}
						</button>

						<button
							className={`nav-item ${activeTab === "summary" ? "active" : ""}`}
							onClick={() => setActiveTab("summary")}
						>
							<span className="nav-icon">
								<FontAwesomeIcon icon={faChartBar} />
							</span>
							<span className="nav-text">Class Summary</span>
							{activeTab === "summary" && (
								<FontAwesomeIcon icon={faChevronRight} className="indicator" />
							)}
						</button>
					</nav>

					<div className="filter-section">
						<h3>
							<FontAwesomeIcon icon={faFilter} className="filter-icon" />
							Filters
						</h3>

						{activeTab === "bySubject" && (
							<div className="filter-content">
								<div className="filter-group">
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

								<div className="filter-group">
									<label htmlFor="student-search">Search Student</label>
									<div className="search-input">
										<input
											type="text"
											id="student-search"
											placeholder="Search by name..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
										<FontAwesomeIcon icon={faSearch} className="search-icon" />
									</div>
								</div>
							</div>
						)}

						{activeTab === "byStudent" && (
							<div className="filter-content">
								<div className="filter-group">
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

					<div className="info-card">
						<div className="info-card-header">
							<FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
							<h3>Need Help?</h3>
						</div>
						<p>
							Use the class grade management system to view, analyze, and export
							student performance data.
						</p>
						<button className="help-button">View Tutorial</button>
					</div>
				</div>

				<div className="content-area">
					{activeTab === "bySubject" && renderSubjectView()}
					{activeTab === "byStudent" && renderStudentView()}
					{activeTab === "summary" && renderSummaryView()}
				</div>
			</div>
		</div>
	);
};

export default ClassGradesPage;
