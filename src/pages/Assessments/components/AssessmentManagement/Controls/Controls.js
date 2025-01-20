import React from "react";
import useAuth from "../../../../../hooks/useAuth";
import PrimaryButton from "../../../../../components/ui/PrimaryButton/PrimaryButton";
import "./Controls.css";

const Controls = ({ course_id }) => {
	const { assignedSubjects } = useAuth();

	console.log("Assigned Subjects:", assignedSubjects);
	console.log("Course ID:", course_id);

	if (!assignedSubjects || assignedSubjects.length === 0) {
		return <div>Loading assigned subjects...</div>;
	}

	const currentSubject = assignedSubjects.find(
		(subject) => subject.subjectId === course_id
	);

	if (!currentSubject) {
		return <div>No subject found for the given course ID.</div>;
	}

	const departmentIds = currentSubject.departmentId || [];

	return (
		<div className="controls-container">
			<select>
				{departmentIds.map((deptId) => (
					<option key={deptId} value={deptId}>
						{deptId}
					</option>
				))}
			</select>

			<input type="text" placeholder="Title" />

			<select>
				{["Exam", "Quiz", "Project", "Homework", "Oral"].map((type) => (
					<option key={type} value={type}>
						{type}
					</option>
				))}
			</select>

			<input type="number" placeholder="Points" max="100" />

			<input type="date" />

			<span className="controls-total-points">
				Used: <strong>0 / 100</strong>
			</span>

			<PrimaryButton title="Add Assessment" />
		</div>
	);
};

export default Controls;
