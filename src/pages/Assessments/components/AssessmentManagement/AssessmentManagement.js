import React, { useState } from "react";
import PrimaryButton from "../../../../components/ui/PrimaryButton/PrimaryButton";
import AssessmentGradesModal from "../AssessmentGradesModal/AssessmentGradesModal";
import "./AssessmentManagement.css";
import {
	grades,
	assessmentTypes,
	assessments as initialAssessments,
} from "../../data/assessmentData";

const AssessmentManagement = () => {
	const [assessments, setAssessments] = useState(initialAssessments);

	const [className, setClassName] = useState("1st Grade");
	const [title, setTitle] = useState("");
	const [type, setType] = useState("Exam");
	const [points, setPoints] = useState("");
	const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

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

	const openModal = (assessment) => {
		setSelectedAssessment(assessment);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedAssessment(null);
	};

	const groupedAssessments = assessments.reduce((acc, assessment) => {
		const { month } = assessment;
		if (!acc[month]) acc[month] = [];
		acc[month].push(assessment);
		return acc;
	}, {});

	const calculateMonthlyPoints = (month) => {
		return assessments
			.filter((assessment) => assessment.month === month)
			.reduce((total, assessment) => total + assessment.points, 0);
	};

	return (
		<>
			<div className="assessment-management">
				<h2>Assessment Management</h2>
				<div className="points-used">
					Total Points Used:{" "}
					{assessments.reduce((total, item) => total + item.points, 0)} / 100
				</div>
				<div className="form-container">
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
					<input
						type="text"
						placeholder="Assessment Title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<select value={type} onChange={(e) => setType(e.target.value)}>
						{assessmentTypes.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
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
					{Object.entries(groupedAssessments).map(([month, assessments]) => (
						<div key={month} className="assessment-month-card">
							<div className="month-header">
								<span className="month-name">{month}</span>
								<span className="points-used-month">
									{calculateMonthlyPoints(month)} Points
								</span>
							</div>
							{assessments.map((assessment, index) => (
								<div
									key={index}
									className="assessment-item"
									onClick={() => openModal(assessment)}
								>
									<div className="assessment-details">
										<span>{assessment.title}</span>
										<span>{assessment.type}</span>
										<span>{assessment.points} Points</span>
									</div>
								</div>
							))}
						</div>
					))}
				</div>

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
		</>
	);
};

export default AssessmentManagement;
