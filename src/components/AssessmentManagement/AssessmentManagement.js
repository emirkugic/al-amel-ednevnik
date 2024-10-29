import React, { useState } from "react";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import TextInput from "../ui/TextInput/TextInput";
import AssessmentGradesModal from "../AssessmentGradesModal/AssessmentGradesModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./AssessmentManagement.css";
import Notification from "../ui/Notification/Notification"; // Import Notification component

const AssessmentManagement = () => {
	const [assessments, setAssessments] = useState([]);
	const [newAssessment, setNewAssessment] = useState({
		name: "",
		type: "",
		points: "",
		gradeLevel: "",
	});
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [notifications, setNotifications] = useState([]); // Manage notifications

	const assessmentTypes = [
		{ value: "exam", label: "Exam" },
		{ value: "quiz", label: "Quiz" },
		{ value: "homework", label: "Homework" },
		{ value: "project", label: "Project" },
		{ value: "oral_exam", label: "Oral Exam" },
	];

	const gradeLevels = Array.from({ length: 12 }, (_, i) => ({
		value: (i + 1).toString(),
		label: `${i + 1}${["st", "nd", "rd"][((i + 1) % 10) - 1] || "th"} Grade`,
	}));

	const calculateTotalPoints = () => {
		return assessments.reduce(
			(total, assessment) => total + assessment.points,
			0
		);
	};

	const addNotification = (type, message) => {
		const id = Date.now();
		setNotifications((prev) => [...prev, { id, type, description: message }]);

		// Auto-remove notification after 5 seconds
		setTimeout(() => removeNotification(id), 5000);
	};

	const removeNotification = (id) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	const handleAddAssessment = () => {
		if (
			!newAssessment.name ||
			!newAssessment.type ||
			!newAssessment.points ||
			!newAssessment.gradeLevel
		) {
			addNotification("error", "Please fill out all fields");
			return;
		}

		const points = parseInt(newAssessment.points);
		const totalpoints = calculateTotalPoints() + points;

		if (totalpoints > 100) {
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
			createdAt: new Date().toLocaleString(), // Capture creation time
		};

		setAssessments([...assessments, assessment]);
		setNewAssessment({
			name: "",
			type: "",
			points: "",
			gradeLevel: "",
		});
	};

	const handleDeleteAssessment = (assessmentId) => {
		const updatedAssessments = assessments.filter(
			(assessment) => assessment.id !== assessmentId
		);
		setAssessments(updatedAssessments);
		addNotification("info", "Assessment deleted successfully");
	};

	const handleOpenModal = (assessment) => {
		setSelectedAssessment(assessment);
		setIsModalOpen(true);
	};

	return (
		<div className="assessment-management-container">
			<div className="assessment-management">
				<h3>Assessments</h3>

				<DropdownSelect
					label="Grade"
					placeholder="Select Grade"
					options={gradeLevels}
					value={newAssessment.gradeLevel}
					onChange={(option) =>
						setNewAssessment({ ...newAssessment, gradeLevel: option.value })
					}
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

				{/* Add Assessment Button */}
				<PrimaryButton title="Add Assessment" onClick={handleAddAssessment} />

				<div className="assessments-list">
					<h4>Current Assessments (Total points: {calculateTotalPoints()}):</h4>
					<div className="assessments-scrollable">
						{assessments.map((assessment) => (
							<div key={assessment.id} className="assessment-item">
								<div
									className="assessment-info"
									onClick={() => handleOpenModal(assessment)}
								>
									<p>
										<strong>{assessment.name}</strong> - {assessment.type}
									</p>
									<p>
										{assessment.points}% of total grade for{" "}
										{assessment.gradeLevel}
									</p>
									<p>Created on: {assessment.createdAt}</p>
								</div>
								{/* Trash Can Icon for Deletion */}
								<button
									className="delete-btn"
									onClick={() => handleDeleteAssessment(assessment.id)}
								>
									<FontAwesomeIcon icon={faTrash} className="trash-icon" />
								</button>
							</div>
						))}
					</div>
				</div>

				{isModalOpen && selectedAssessment && (
					<AssessmentGradesModal
						assessment={selectedAssessment}
						onClose={() => setIsModalOpen(false)}
					/>
				)}

				{/* Pass notifications and removeNotification function to Notification component */}
				<Notification
					notifications={notifications}
					removeNotification={removeNotification}
				/>
			</div>
		</div>
	);
};

export default AssessmentManagement;
