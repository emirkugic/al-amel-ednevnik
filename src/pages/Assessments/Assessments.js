import React from "react";
import { useParams } from "react-router-dom";
import AssessmentManagement from "./components/AssessmentManagement/AssessmentManagement"; // Reuse core AssessmentManagement functionality

const SubjectAssessmentManagement = () => {
	const { subject } = useParams(); // Capture the subject name from the URL

	return (
		<div className="subject-assessment-management">
			{/* <h2>{subject.replace(/-/g, " ")} </h2> */}
			<AssessmentManagement />
		</div>
	);
};

export default SubjectAssessmentManagement;
