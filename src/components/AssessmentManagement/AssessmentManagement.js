import React, { useState } from "react";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import AssessmentGradesModal from "../AssessmentGradesModal/AssessmentGradesModal";
import "./AssessmentManagement.css";

const AssessmentManagement = () => {
	const [assessments, setAssessments] = useState([
		// Pre-existing data for September, October, and November
		{
			className: "1st Grade",
			title: "Math Quiz",
			type: "Quiz",
			points: 10,
			date: "2024-09-15",
			month: "September",
			semesterKey: "1st Grade - First Semester",
		},
		{
			className: "1st Grade",
			title: "Math Project",
			type: "Project",
			points: 10,
			date: "2024-09-28",
			month: "September",
			semesterKey: "1st Grade - First Semester",
		},
		{
			className: "1st Grade",
			title: "Science Exam",
			type: "Exam",
			points: 10,
			date: "2024-10-10",
			month: "October",
			semesterKey: "1st Grade - First Semester",
		},
		{
			className: "1st Grade",
			title: "Science Homework",
			type: "Homework",
			points: 10,
			date: "2024-10-20",
			month: "October",
			semesterKey: "1st Grade - First Semester",
		},
		{
			className: "1st Grade",
			title: "History Quiz",
			type: "Quiz",
			points: 10,
			date: "2024-11-05",
			month: "November",
			semesterKey: "1st Grade - First Semester",
		},
		{
			className: "1st Grade",
			title: "History Project",
			type: "Project",
			points: 10,
			date: "2024-11-18",
			month: "November",
			semesterKey: "1st Grade - First Semester",
		},
	]);

	const [className, setClassName] = useState("1st Grade");
	const [title, setTitle] = useState("");
	const [type, setType] = useState("Exam");
	const [points, setPoints] = useState("");
	const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
	const [selectedAssessment, setSelectedAssessment] = useState(null); // New state
	const [isModalOpen, setIsModalOpen] = useState(false); // New state

	const addAssessment = () => {
		const selectedDate = new Date(date);
		const semester = getSemester(selectedDate);
		const month = selectedDate.toLocaleString("default", { month: "long" });
		const semesterKey = `${className} - ${semester}`;

		const semesterTotal = assessments
			.filter((assessment) => assessment.semesterKey === semesterKey)
			.reduce((sum, assessment) => sum + parseInt(assessment.points), 0);

		if (semesterTotal + parseInt(points) <= 100) {
			const newAssessment = {
				className,
				title,
				type,
				points: parseInt(points),
				date,
				month,
				semesterKey,
			};
			setAssessments([...assessments, newAssessment]);
			clearForm();
		} else {
			alert(`Total points for ${className} in ${semester} cannot exceed 100.`);
		}
	};

	const getSemester = (date) => {
		const month = date.getMonth() + 1;
		return month >= 9 || month <= 12 ? "First Semester" : "Second Semester";
	};

	const clearForm = () => {
		setClassName("1st Grade");
		setTitle("");
		setType("Exam");
		setPoints("");
		setDate(new Date().toISOString().substring(0, 10));
	};

	// Function to open modal
	const openModal = (assessment) => {
		setSelectedAssessment(assessment);
		setIsModalOpen(true);
	};

	// Function to close modal
	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedAssessment(null);
	};

	const groupedAssessments = assessments.reduce((acc, assessment) => {
		const { semesterKey, month } = assessment;
		if (!acc[semesterKey]) acc[semesterKey] = {};
		if (!acc[semesterKey][month]) acc[semesterKey][month] = [];
		acc[semesterKey][month].push(assessment);
		return acc;
	}, {});

	return (
		<div className="assessment-management">
			<h2>Assessment Management</h2>
			<div className="form-container">
				<select
					value={className}
					onChange={(e) => setClassName(e.target.value)}
				>
					<option value="1st Grade">1st Grade</option>
					<option value="2nd Grade">2nd Grade</option>
					<option value="3rd Grade">3rd Grade</option>
					<option value="4th Grade">4th Grade</option>
					<option value="5th Grade">5th Grade</option>
					<option value="6th Grade">6th Grade</option>
					<option value="7th Grade">7th Grade</option>
					<option value="8th Grade">8th Grade</option>
					<option value="9th Grade">9th Grade</option>
					<option value="10th Grade">10th Grade</option>
					<option value="11th Grade">11th Grade</option>
					<option value="12th Grade">12th Grade</option>
				</select>
				<input
					type="text"
					placeholder="Assessment Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<select value={type} onChange={(e) => setType(e.target.value)}>
					<option value="Exam">Exam</option>
					<option value="Project">Project</option>
					<option value="Homework">Homework</option>
					<option value="Quiz">Quiz</option>
				</select>
				<input
					type="number"
					placeholder="Points (out of 100)"
					value={points}
					onChange={(e) => setPoints(e.target.value)}
					max="100"
				/>
				<input
					type="date"
					value={date}
					onChange={(e) => setDate(e.target.value)}
				/>
				<PrimaryButton title="Add Assessment" onClick={addAssessment} />
			</div>

			<div className="assessment-list">
				{Object.keys(groupedAssessments).length > 0 ? (
					Object.entries(groupedAssessments).map(([semesterKey, months]) => {
						const semesterTotal = Object.values(months)
							.flat()
							.reduce((sum, assessment) => sum + assessment.points, 0);

						return (
							<div key={semesterKey} className="assessment-semester">
								<h3>{semesterKey}</h3>
								<div className="points-summary">
									<div className="progress-bar">
										<div
											className="progress-fill"
											style={{ width: `${(semesterTotal / 100) * 100}%` }}
										></div>
									</div>
									<span>{semesterTotal}/100 Points</span>
								</div>

								{Object.entries(months).map(([month, assessments]) => (
									<div key={month} className="assessment-month">
										<h4>{month}</h4>
										{assessments.map((assessment, index) => (
											<div
												key={index}
												className="assessment-item"
												onClick={() => openModal(assessment)} // Open modal on click
											>
												<div className="assessment-details">
													<span>
														<strong>Class:</strong> {assessment.className}
													</span>
													<span>
														<strong>Title:</strong> {assessment.title}
													</span>
													<span>
														<strong>Type:</strong> {assessment.type}
													</span>
													<span>
														<strong>Points:</strong> {assessment.points}
													</span>
													<span>
														<strong>Date:</strong> {assessment.date}
													</span>
												</div>
											</div>
										))}
									</div>
								))}
							</div>
						);
					})
				) : (
					<p>No assessments created yet.</p>
				)}
			</div>

			{/* Conditionally render AssessmentGradesModal */}
			{isModalOpen && (
				<AssessmentGradesModal
					assessment={selectedAssessment}
					students={[
						{ id: 1, name: "John Doe", grade: 8 },
						{ id: 2, name: "Jane Doe", grade: 9 },
						{ id: 3, name: "Alice Wonderland", grade: 7 },
						{ id: 4, name: "Bobs Burgers", grade: 6 },
						{ id: 5, name: "Emir Kugić", grade: 5 },
					]}
					onClose={closeModal}
				/>
			)}
		</div>
	);
};

export default AssessmentManagement;
