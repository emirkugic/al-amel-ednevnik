import React, { useState } from "react";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import TextInput from "../ui/TextInput/TextInput";
import AssessmentGradesModal from "../AssessmentGradesModal/AssessmentGradesModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./AssessmentManagement.css";

const AssessmentManagement = () => {
	const [assessments, setAssessments] = useState([]);
	const [newAssessment, setNewAssessment] = useState({
		name: "",
		type: "",
		weight: "",
		gradeLevel: "",
	});
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

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

	const calculateTotalWeight = () => {
		return assessments.reduce(
			(total, assessment) => total + assessment.weight,
			0
		);
	};

	const handleAddAssessment = () => {
		if (
			!newAssessment.name ||
			!newAssessment.type ||
			!newAssessment.weight ||
			!newAssessment.gradeLevel
		) {
			setErrorMessage("Please fill out all fields");
			return;
		}

		const weight = parseInt(newAssessment.weight);
		const totalWeight = calculateTotalWeight() + weight;

		if (totalWeight > 100) {
			setErrorMessage(
				`Total weight cannot exceed 100%. Current total: ${calculateTotalWeight()}%.`
			);
			return;
		}

		const assessment = {
			id: Date.now(),
			...newAssessment,
			weight: weight,
			createdAt: new Date().toLocaleString(), // Capture creation time
		};

		console.log("New Assessment Created:", assessment); // Log the assessment and its creation time

		setAssessments([...assessments, assessment]);
		setNewAssessment({
			name: "",
			type: "",
			weight: "",
			gradeLevel: "",
		});
		setErrorMessage(""); // Clear error message on successful submission
	};

	const handleDeleteAssessment = (assessmentId) => {
		const updatedAssessments = assessments.filter(
			(assessment) => assessment.id !== assessmentId
		);
		setAssessments(updatedAssessments);
	};

	const handleOpenModal = (assessment) => {
		setSelectedAssessment(assessment);
		setIsModalOpen(true);
	};

	return (
		<div className="assessment-management-container">
			<div className="assessment-management">
				<h3>Assessments</h3>
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
					label="Weight (%)"
					placeholder="Enter weight in %"
					value={newAssessment.weight}
					onChange={(e) =>
						setNewAssessment({ ...newAssessment, weight: e.target.value })
					}
				/>

				{/* Error Message */}
				{errorMessage && <p className="error-message">{errorMessage}</p>}

				{/* Add Assessment Button */}
				<PrimaryButton title="Add Assessment" onClick={handleAddAssessment} />

				<div className="assessments-list">
					<h4>
						Current Assessments (Total Weight: {calculateTotalWeight()}%):
					</h4>
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
										{assessment.weight}% of total grade for{" "}
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
			</div>
		</div>
	);
};

export default AssessmentManagement;
