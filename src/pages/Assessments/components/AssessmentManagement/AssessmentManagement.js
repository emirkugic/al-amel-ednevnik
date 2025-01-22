import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Controls from "./Controls/Controls";
import AssessmentsAccordionList from "./AssessmentsAccordionList/AssessmentsAccordionList";
import AssessmentGradesModal from "../AssessmentGradesModal/AssessmentGradesModal";
import useAuth from "../../../../hooks/useAuth";
import useAssessments from "../../../../hooks/useAssessments";
import "./AssessmentManagement.css";
import "../../data/assessmentData.js";
import { testStudents } from "../../data/assessmentData.js";

const FIRST_SEMESTER_MONTHS = ["September", "October", "November", "December"];
const SECOND_SEMESTER_MONTHS = ["February", "March", "April", "May", "June"];

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
	const { subject } = useParams();
	const { user } = useAuth();
	const {
		assessments,
		fetchFilteredAssessments,
		addAssessment,
		updateAssessment,
		deleteAssessment,
	} = useAssessments(user?.token);

	const [selectedDepartment, setSelectedDepartment] = useState("");

	const [selectedSemester, setSelectedSemester] = useState(() => {
		const today = new Date();
		const currentMonth = today.getMonth() + 1;
		// If currentMonth is Sep-Dec (>=9) or Jan (1) then pick first semester
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

	useEffect(() => {
		if (user?.id && subject && selectedDepartment) {
			fetchFilteredAssessments(user.id, subject, selectedDepartment, start);
		}
	}, [user?.id, subject, selectedDepartment, start]);

	// Add new assessment
	const handleAddAssessment = async (newAssessment) => {
		try {
			await addAssessment(newAssessment);
			setTitle("");
			setType("Exam");
			setPoints("");
			setDate(new Date().toISOString().substring(0, 10));
		} catch (err) {
			console.error("Error adding assessment:", err);
		}
	};

	// Update an existing assessment
	const handleUpdateAssessment = async (id, updatedAssessment) => {
		try {
			await updateAssessment(id, updatedAssessment);
		} catch (err) {
			console.error("Error updating assessment:", err);
		}
	};

	// Delete an existing assessment
	const handleDeleteAssessment = async (id) => {
		try {
			await deleteAssessment(id);
		} catch (err) {
			console.error("Error deleting assessment:", err);
		}
	};

	// Grades modal
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
		const monthName = new Date(assessment.date).toLocaleString("default", {
			month: "long",
		});
		if (!acc[monthName]) acc[monthName] = [];
		acc[monthName].push(assessment);
		return acc;
	}, {});

	// Decide which months to display
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

				{/* Controls for adding new assessment */}
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
						selectedDepartment={selectedDepartment}
						setSelectedDepartment={setSelectedDepartment}
					/>

					{/* Accordion List of Assessments */}
					<AssessmentsAccordionList
						monthsToDisplay={monthsToDisplay}
						groupedAssessments={groupedAssessments}
						openGradesModal={openGradesModal}
						onDelete={handleDeleteAssessment}
					/>
				</div>
			</div>

			{isGradesModalOpen && (
				<AssessmentGradesModal
					assessment={selectedAssessment}
					onClose={closeGradesModal}
					students={testStudents}
					/* Provide an array here, or real data if you have it */
				/>
			)}
		</div>
	);
};

export default AssessmentManagement;
