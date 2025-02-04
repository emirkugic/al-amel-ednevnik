import React from "react";
import { useParams } from "react-router-dom";
import AssessmentManagement from "./components/AssessmentManagement/AssessmentManagement";

const AssessmentPage = () => {
	const { subject } = useParams(); // Capture the subject id from the URL

	return (
		<div className="subject-assessment-management">
			<AssessmentManagement />
		</div>
	);
};

export default AssessmentPage;
