import React, { useState } from "react";
import PrimaryButton from "../../../../components/ui/PrimaryButton/PrimaryButton";
import AssessmentGradesModal from "../AssessmentGradesModal/AssessmentGradesModal";
import {
	grades,
	assessmentTypes,
	assessments as initialAssessments,
} from "../../data/assessmentData";
import "./AssessmentManagement.css";

const FIRST_SEMESTER_MONTHS = ["September", "October", "November", "December"];
const SECOND_SEMESTER_MONTHS = ["February", "March", "April", "May", "June"];

const AssessmentManagement = () => {
	const [assessments, setAssessments] = useState(initialAssessments);

	// Determine current semester based on today's date
	const today = new Date();
	const currentMonth = today.getMonth() + 1;
	const defaultSemester =
		currentMonth >= 9 || currentMonth <= 12
			? "First Semester"
			: "Second Semester";

	const [selectedSemester, setSelectedSemester] = useState(defaultSemester);

	const [className, setClassName] = useState("1st Grade");
	const [title, setTitle] = useState("");
	const [type, setType] = useState("Exam");
	const [points, setPoints] = useState("");
	const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	const addAssessment = () => {
		const selectedDate = new Date(date);
		const semester = getSemester(selectedDate);
		const month = selectedDate.toLocaleString("default", { month: "long" });
		const semesterKey = `${className} - ${semester}`;

		const semesterTotal = assessments
			.filter((ass) => ass.semesterKey === semesterKey)
			.reduce((sum, ass) => sum + parseInt(ass.points), 0);

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
			closeAddModal();
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

	const openGradesModal = (assessment) => {
		setSelectedAssessment(assessment);
		setIsGradesModalOpen(true);
	};

	const closeGradesModal = () => {
		setIsGradesModalOpen(false);
		setSelectedAssessment(null);
	};

	const openAddModal = () => {
		setIsAddModalOpen(true);
	};

	const closeAddModal = () => {
		setIsAddModalOpen(false);
		clearForm();
	};

	// Group assessments by month
	const groupedAssessments = assessments.reduce((acc, assessment) => {
		const { month } = assessment;
		if (!acc[month]) acc[month] = [];
		acc[month].push(assessment);
		return acc;
	}, {});

	const monthsToDisplay =
		selectedSemester === "First Semester"
			? FIRST_SEMESTER_MONTHS
			: SECOND_SEMESTER_MONTHS;

	const totalPoints = assessments.reduce(
		(total, item) => total + item.points,
		0
	);

	const calculateMonthlyPoints = (month) => {
		return (groupedAssessments[month] || []).reduce(
			(sum, a) => sum + a.points,
			0
		);
	};

	return (
		<div className="assessment-management">
			<div className="ram-header">
				<h2 className="ram-title">Assessments</h2>
				<p className="ram-subtitle">
					Manage and track assessments by class and semester
				</p>
			</div>

			<div className="ram-nav-bar">
				<div className="ram-tabs">
					<button
						className={`ram-tab ${
							selectedSemester === "First Semester" ? "active" : ""
						}`}
						onClick={() => setSelectedSemester("First Semester")}
					>
						1st Semester (Sept - Dec)
					</button>
					<button
						className={`ram-tab ${
							selectedSemester === "Second Semester" ? "active" : ""
						}`}
						onClick={() => setSelectedSemester("Second Semester")}
					>
						2nd Semester (Feb - June)
					</button>
				</div>
				<div className="ram-actions">
					<span className="ram-total-points">
						Total Used: <strong>{totalPoints} / 100</strong>
					</span>
					<PrimaryButton title="Add Assessment" onClick={openAddModal} />
				</div>
			</div>

			<div className="ram-content">
				{monthsToDisplay.map((month) => {
					const monthAssessments = groupedAssessments[month] || [];
					return (
						<div key={month} className="ram-month-block">
							<div className="ram-month-header">
								<h3>{month}</h3>
								<span className="ram-month-points">
									{calculateMonthlyPoints(month)} pts
								</span>
							</div>
							{monthAssessments.length === 0 ? (
								<div className="ram-empty-month">No assessments this month</div>
							) : (
								<div className="ram-assessment-list">
									{monthAssessments.map((assessment, idx) => (
										<div
											key={idx}
											className="ram-assessment-item"
											onClick={() => openGradesModal(assessment)}
										>
											<div className="ram-assessment-info">
												<h4 className="ram-assessment-title">
													{assessment.title}
												</h4>
												<span className="ram-assessment-type">
													{assessment.type}
												</span>
											</div>
											<div className="ram-assessment-points">
												{assessment.points} pts
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{isAddModalOpen && (
				<div className="ram-modal-overlay">
					<div className="ram-modal">
						<h3>Add New Assessment</h3>
						<div className="ram-modal-form">
							<label>
								Class:
								<select
									value={className}
									onChange={(e) => setClassName(e.target.value)}
								>
									{grades.map((grade) => (
										<option key={grade} value={grade}>
											{grade}
										</option>
									))}
								</select>
							</label>

							<label>
								Title:
								<input
									type="text"
									placeholder="Assessment Title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
							</label>

							<label>
								Type:
								<select value={type} onChange={(e) => setType(e.target.value)}>
									{assessmentTypes.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</label>

							<label>
								Points:
								<input
									type="number"
									placeholder="Points (0-100)"
									value={points}
									onChange={(e) => setPoints(e.target.value)}
									max="100"
								/>
							</label>

							<label>
								Date:
								<input
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
								/>
							</label>
						</div>
						<div className="ram-modal-actions">
							<PrimaryButton title="Add" onClick={addAssessment} />
							<button className="ram-cancel-btn" onClick={closeAddModal}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{isGradesModalOpen && (
				<AssessmentGradesModal
					assessment={selectedAssessment}
					students={[
						{ id: 1, name: "John Doe", grade: 8 },
						{ id: 2, name: "Jane Doe", grade: 9 },
						{ id: 3, name: "Alice Wonderland", grade: 7 },
						{ id: 4, name: "Bobs Burgers", grade: 6 },
						{ id: 5, name: "Emir Kugić", grade: 5 },
					]}
					onClose={closeGradesModal}
				/>
			)}
		</div>
	);
};

export default AssessmentManagement;
