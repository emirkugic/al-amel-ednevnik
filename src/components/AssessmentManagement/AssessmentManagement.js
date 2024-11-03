import React, { useState } from "react";
import { useParams } from "react-router-dom";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import TextInput from "../ui/TextInput/TextInput";
import Notification from "../ui/Notification/Notification";
import AssessmentItem from "../ui/AssessmentItem/AssessmentItem";
import "./AssessmentManagement.css";

const AssessmentManagement = () => {
	const { subject } = useParams();
	const [assessments, setAssessments] = useState({});
	const [newAssessment, setNewAssessment] = useState({
		name: "",
		type: "", // Set as empty to force selection
		points: "",
		gradeLevel: "",
	});
	const [selectedGrade, setSelectedGrade] = useState("");
	const [notifications, setNotifications] = useState([]);

	const assessmentTypes = [
		{ value: "", label: "Please select a type" }, // Default placeholder option
		{ value: "activity", label: "Activity" },
		{ value: "exam", label: "Exam" },
		{ value: "quiz", label: "Quiz" },
		{ value: "homework", label: "Homework" },
		{ value: "project", label: "Project" },
		{ value: "oral_exam", label: "Oral Exam" },
	];

	const gradeLevels = Array.from({ length: 12 }, (_, i) => {
		const gradeNumber = i + 1;
		const suffix = [11, 12, 13].includes(gradeNumber)
			? "th"
			: ["st", "nd", "rd"][(gradeNumber % 10) - 1] || "th";

		return {
			value: gradeNumber.toString(),
			label: `${gradeNumber}${suffix} Grade`,
		};
	});

	const calculateTotalPoints = () => {
		return (assessments[selectedGrade] || []).reduce(
			(total, assessment) => total + assessment.points,
			0
		);
	};

	const addNotification = (type, message) => {
		const id = Date.now();
		setNotifications((prev) => [...prev, { id, type, description: message }]);
		setTimeout(() => removeNotification(id), 5000);
	};

	const removeNotification = (id) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	const handleAddAssessment = () => {
		if (
			!newAssessment.name ||
			!newAssessment.type || // Ensure type is selected
			!newAssessment.points ||
			!selectedGrade
		) {
			addNotification("error", "Please fill out all fields");
			return;
		}

		const points = parseInt(newAssessment.points);
		const totalPoints = calculateTotalPoints() + points;

		if (totalPoints > 100) {
			addNotification(
				"warning",
				<>
					Total points cannot exceed 100. <br />
					Current total: {calculateTotalPoints()}.
				</>
			);
			return;
		}

		const assessment = {
			id: Date.now(),
			...newAssessment,
			points: points,
			createdAt: new Date().toLocaleString(),
		};

		setAssessments((prev) => ({
			...prev,
			[selectedGrade]: [...(prev[selectedGrade] || []), assessment],
		}));

		// Reset new assessment fields after adding
		setNewAssessment({
			name: "",
			type: "", // Reset type to empty, forcing re-selection
			points: "",
			gradeLevel: "",
		});
	};

	const handleDeleteAssessment = (assessmentId) => {
		setAssessments((prev) => ({
			...prev,
			[selectedGrade]: (prev[selectedGrade] || []).filter(
				(assessment) => assessment.id !== assessmentId
			),
		}));
		addNotification("info", "Assessment deleted successfully");
	};

	return (
		<div className="assessment-management-container">
			<h3>
				Manage Assessments for{" "}
				{subject.charAt(0).toUpperCase() + subject.slice(1)}
			</h3>

			<DropdownSelect
				label="Grade"
				placeholder="Select Grade"
				options={gradeLevels}
				value={selectedGrade}
				onChange={(option) => {
					setSelectedGrade(option.value);
				}}
			/>

			<TextInput
				label="Assessment Name"
				placeholder="Enter assessment name"
				value={newAssessment.name}
				onChange={(e) =>
					setNewAssessment({ ...newAssessment, name: e.target.value })
				}
			/>
			<DropdownSelect
				label="Type"
				placeholder="Select Type"
				options={assessmentTypes}
				value={newAssessment.type}
				onChange={(option) =>
					setNewAssessment({ ...newAssessment, type: option.value })
				}
			/>
			<TextInput
				label="Points"
				placeholder="Enter points"
				value={newAssessment.points}
				onChange={(e) =>
					setNewAssessment({ ...newAssessment, points: e.target.value })
				}
			/>

			<PrimaryButton title="Add Assessment" onClick={handleAddAssessment} />

			<div className="assessments-list">
				<h4>Assessments for {selectedGrade} Grade</h4>
				<div className="assessments-scrollable">
					{(assessments[selectedGrade] || []).map((assessment) => (
						<AssessmentItem
							key={assessment.id}
							name={assessment.name}
							type={assessment.type}
							points={assessment.points}
							gradeLevel={selectedGrade}
							createdAt={assessment.createdAt}
							onDelete={() => handleDeleteAssessment(assessment.id)}
						/>
					))}
				</div>
			</div>

			<Notification
				notifications={notifications}
				removeNotification={removeNotification}
			/>
		</div>
	);
};

export default AssessmentManagement;
