import React, { useState } from "react";
import "./AddEditSubjectModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const AddEditSubjectModal = ({ isOpen, onClose, onSave, initialData }) => {
	const [subjectTitle, setSubjectTitle] = useState(initialData?.name || "");
	const [description, setDescription] = useState(
		initialData?.description || ""
	);
	const [selectedGrades, setSelectedGrades] = useState(
		initialData?.gradeLevels || []
	);

	const toggleGrade = (grade) => {
		setSelectedGrades((prevGrades) =>
			prevGrades.includes(String(grade))
				? prevGrades.filter((g) => g !== String(grade))
				: [...prevGrades, String(grade)]
		);
	};

	const handleSave = () => {
		onSave({ name: subjectTitle, description, gradeLevels: selectedGrades });
		onClose();
	};

	return (
		isOpen && (
			<div className="modal-overlay">
				<div className="modal-content">
					<div className="modal-header">
						<button onClick={onClose} className="close-button">
							<FontAwesomeIcon icon={faTimes} />
						</button>
					</div>
					<div className="modal-body">
						<label>Subject Title</label>
						<input
							type="text"
							placeholder="e.g., Mathematics"
							value={subjectTitle}
							onChange={(e) => setSubjectTitle(e.target.value)}
						/>

						<label>Description</label>
						<textarea
							placeholder="Brief description of the subject"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>

						<label>Applicable Grades</label>
						<div className="grades-grid">
							{[...Array(12)].map((_, index) => {
								const grade = index + 1;
								return (
									<button
										key={grade}
										className={`grade-button ${
											selectedGrades.includes(String(grade)) ? "selected" : ""
										}`}
										onClick={() => toggleGrade(grade)}
									>
										{grade}
									</button>
								);
							})}
						</div>
					</div>
					<div className="modal-footer">
						<button onClick={onClose} className="cancel-button">
							Cancel
						</button>
						<button onClick={handleSave} className="save-button">
							{initialData ? "Update Subject" : "Create Subject"}
						</button>
					</div>
				</div>
			</div>
		)
	);
};

export default AddEditSubjectModal;
