import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Controls from "./Controls/Controls";
import AssessmentsAccordionList from "./AssessmentsAccordionList/AssessmentsAccordionList";
import AssessmentGradesModal from "../AssessmentGradesModal/AssessmentGradesModal";
import useAuth from "../../../../hooks/useAuth";
import useAssessments from "../../../../hooks/useAssessments";
import "./AssessmentManagement.css";

const FIRST_SEMESTER_MONTHS = ["September", "October", "November", "December"];
const SECOND_SEMESTER_MONTHS = ["February", "March", "April", "May", "June"];

// Calculate the current school year
const calculateSchoolYear = () => {
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;

	return {
		start: month >= 9 ? `${year}-09-01` : `${year - 1}-09-01`,
		end: month >= 9 ? `${year + 1}-08-31` : `${year}-08-31`,
	};
};

const AssessmentManagement = () => {
	const { subject } = useParams(); // The subject/course ID from URL
	const { user } = useAuth();
	const { assessments, fetchFilteredAssessments, addAssessment } =
		useAssessments(user?.token);

	// Keep the selectedDepartment in this parent
	const [selectedDepartment, setSelectedDepartment] = useState("");

	const [selectedSemester, setSelectedSemester] = useState(() => {
		const today = new Date();
		const currentMonth = today.getMonth() + 1;
		// Simple check: if it's >= 9 or <= 12 => "First Semester"
		return currentMonth >= 9 || currentMonth <= 12
			? "First Semester"
			: "Second Semester";
	});

	const [title, setTitle] = useState("");
	const [type, setType] = useState("Exam");
	const [points, setPoints] = useState("");
	const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);

	const { start } = calculateSchoolYear();

	// Whenever the user, subject, or selectedDepartment changes,
	// fetch the filtered assessments.
	useEffect(() => {
		// If we have all the needed data, call fetch with the chosen department
		if (user?.id && subject && selectedDepartment) {
			fetchFilteredAssessments(user.id, subject, selectedDepartment, start);
		}
	}, [user?.id, subject, selectedDepartment, start]);

	// Handle adding a new assessment
	const handleAddAssessment = async (newAssessment) => {
		try {
			await addAssessment(newAssessment);
			// Clear form inputs
			setTitle("");
			setType("Exam");
			setPoints("");
			setDate(new Date().toISOString().substring(0, 10));
		} catch (err) {
			console.error("Error adding assessment:", err);
		}
	};

	// Grades modal handlers
	const openGradesModal = (assessment) => {
		setSelectedAssessment(assessment);
		setIsGradesModalOpen(true);
	};

	const closeGradesModal = () => {
		setIsGradesModalOpen(false);
		setSelectedAssessment(null);
	};

	// Group assessments by month for display in Accordion
	const groupedAssessments = assessments.reduce((acc, assessment) => {
		const monthName = new Date(assessment.date).toLocaleString("default", {
			month: "long",
		});
		if (!acc[monthName]) acc[monthName] = [];
		acc[monthName].push(assessment);
		return acc;
	}, {});

	// Decide which months to display based on the selected semester
	const monthsToDisplay =
		selectedSemester === "First Semester"
			? FIRST_SEMESTER_MONTHS
			: SECOND_SEMESTER_MONTHS;

	return (
		<div className="assessment-management">
			<div className="ram-container">
				{/* Semester Tabs */}
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
						course_id={subject}
						grades={[]}
						assessmentTypes={["Exam", "Quiz", "Project", "Homework"]}
						title={title}
						setTitle={setTitle}
						type={type}
						setType={setType}
						points={points}
						setPoints={setPoints}
						date={date}
						setDate={setDate}
						addAssessmentCallback={handleAddAssessment}
						// Now pass the parent's selectedDepartment
						selectedDepartment={selectedDepartment}
						setSelectedDepartment={setSelectedDepartment}
					/>

					{/* Assessments Accordion */}
					<AssessmentsAccordionList
						monthsToDisplay={monthsToDisplay}
						groupedAssessments={groupedAssessments}
						openGradesModal={openGradesModal}
					/>
				</div>
			</div>

			{/* Grades Modal */}
			{isGradesModalOpen && (
				<AssessmentGradesModal
					assessment={selectedAssessment}
					onClose={closeGradesModal}
				/>
			)}
		</div>
	);
};

export default AssessmentManagement;
