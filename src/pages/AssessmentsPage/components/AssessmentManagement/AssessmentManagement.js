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
		fetchStudentsAndGrades,
	} = useAssessments(user?.token);

	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [selectedSemester, setSelectedSemester] = useState("Second Semester");
	const [title, setTitle] = useState("");
	const [type, setType] = useState("Exam");
	const [points, setPoints] = useState("");
	const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [studentsAndGrades, setStudentsAndGrades] = useState([]);
	const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);

	const { start } = calculateSchoolYear();

	useEffect(() => {
		if (user?.id && subject && selectedDepartment) {
			fetchFilteredAssessments(user.id, subject, selectedDepartment, start);
		}
	}, [user?.id, subject, selectedDepartment, start]);

	const openGradesModal = async (assessment) => {
		try {
			setSelectedAssessment(assessment);
			const students = await fetchStudentsAndGrades(assessment.id); // Fetch students and grades
			setStudentsAndGrades(students);
			setIsGradesModalOpen(true);
		} catch (err) {
			console.error("Error opening grades modal:", err);
		}
	};

	const closeGradesModal = () => {
		setIsGradesModalOpen(false);
		setSelectedAssessment(null);
		setStudentsAndGrades([]);
	};

	const groupedAssessments = assessments.reduce((acc, assessment) => {
		const monthName = new Date(assessment.date).toLocaleString("default", {
			month: "long",
		});
		if (!acc[monthName]) acc[monthName] = [];
		acc[monthName].push(assessment);
		return acc;
	}, {});

	const monthsToDisplay =
		selectedSemester === "First Semester"
			? FIRST_SEMESTER_MONTHS
			: SECOND_SEMESTER_MONTHS;

	return (
		<div className="assessment-management">
			<div className="ram-container">
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

				<div className="ram-options-row">
					<Controls
						course_id={subject}
						grades={[]}
						assessmentTypes={[
							"Exam",
							"Quiz",
							"Project",
							"Homework",
							"Activity",
							"Other",
						]}
						title={title}
						setTitle={setTitle}
						type={type}
						setType={setType}
						points={points}
						setPoints={setPoints}
						date={date}
						setDate={setDate}
						addAssessmentCallback={addAssessment}
						selectedDepartment={selectedDepartment}
						setSelectedDepartment={setSelectedDepartment}
					/>

					<AssessmentsAccordionList
						monthsToDisplay={monthsToDisplay}
						groupedAssessments={groupedAssessments}
						openGradesModal={openGradesModal}
						onDelete={deleteAssessment}
					/>
				</div>
			</div>

			{isGradesModalOpen && (
				<AssessmentGradesModal
					assessment={selectedAssessment}
					token={user?.token}
					onClose={closeGradesModal}
				/>
			)}
		</div>
	);
};

export default AssessmentManagement;
