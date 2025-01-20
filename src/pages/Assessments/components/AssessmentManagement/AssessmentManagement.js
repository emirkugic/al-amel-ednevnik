import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Controls from "./Controls/Controls";
import AssessmentsAccordionList from "./AssessmentsAccordionList/AssessmentsAccordionList";
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
	const { subject } = useParams();

	// console.log("Route URL:", window.location.pathname); // Logs the route URL
	// console.log("Course ID from Params:", subject); // Logs the course_id from URL params

	const [assessments, setAssessments] = useState(initialAssessments);

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

	const openGradesModal = (assessment) => {
		setSelectedAssessment(assessment);
		setIsGradesModalOpen(true);
	};

	const closeGradesModal = () => {
		setIsGradesModalOpen(false);
		setSelectedAssessment(null);
	};

	// Group assessments by month
	const groupedAssessments = assessments.reduce((acc, assessment) => {
		const { month } = assessment;
		if (!acc[month]) acc[month] = [];
		acc[month].push(assessment);
		return acc;
	}, {});

	// Decide which months to display based on selected semester
	const monthsToDisplay =
		selectedSemester === "First Semester"
			? FIRST_SEMESTER_MONTHS
			: SECOND_SEMESTER_MONTHS;

	const totalPoints = assessments.reduce(
		(total, item) => total + item.points,
		0
	);

	return (
		<div className="assessment-management">
			<div className="ram-container">
				{/* Tabs Row */}
				<div className="ram-tab-row">
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
				</div>

				{/* Controls Row */}
				<div className="ram-options-row">
					<Controls
						course_id={subject} // Pass the course_id to Controls
						grades={grades}
						assessmentTypes={assessmentTypes}
						className={className}
						setClassName={setClassName}
						title={title}
						setTitle={setTitle}
						type={type}
						setType={setType}
						points={points}
						setPoints={setPoints}
						date={date}
						setDate={setDate}
						totalPoints={totalPoints}
						addAssessment={addAssessment}
					/>
					{/* Assessments Accordion List */}
					<AssessmentsAccordionList
						monthsToDisplay={monthsToDisplay}
						groupedAssessments={groupedAssessments}
						openGradesModal={openGradesModal}
					/>
				</div>
			</div>

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
