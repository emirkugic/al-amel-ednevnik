import React, { useState, useEffect, useRef } from "react";
import "./AddEditSubjectModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTimes,
	faGraduationCap,
	faBook,
	faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../../../../contexts";

const AddEditSubjectModal = ({ isOpen, onClose, onSave, initialData }) => {
	const { t } = useLanguage();
	const [subjectName, setSubjectName] = useState(initialData?.name || "");
	const [selectedGrades, setSelectedGrades] = useState(
		initialData?.gradeLevels || []
	);
	const [nameError, setNameError] = useState("");
	const modalRef = useRef(null);
	const nameInputRef = useRef(null);

	// Focus the name input when the modal opens
	useEffect(() => {
		if (isOpen && nameInputRef.current) {
			nameInputRef.current.focus();
		}
	}, [isOpen]);

	// Handle click outside of modal to close
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Handle ESC key to close modal
	useEffect(() => {
		const handleEscKey = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscKey);
		}

		return () => {
			document.removeEventListener("keydown", handleEscKey);
		};
	}, [isOpen, onClose]);

	const toggleGrade = (grade) => {
		setSelectedGrades((prevGrades) =>
			prevGrades.includes(String(grade))
				? prevGrades.filter((g) => g !== String(grade))
				: [...prevGrades, String(grade)]
		);
	};

	const handleSave = () => {
		// Validate inputs
		if (!subjectName.trim()) {
			setNameError(t("subjectModal.subjectNameRequired"));
			return;
		}

		onSave({
			name: subjectName.trim(),
			gradeLevels: selectedGrades.sort((a, b) => a - b),
		});
	};

	const selectAllGrades = () => {
		setSelectedGrades([...Array(12)].map((_, i) => String(i + 1)));
	};

	const clearAllGrades = () => {
		setSelectedGrades([]);
	};

	if (!isOpen) return null;

	return (
		<div className="subject-modal-overlay">
			<div className="subject-modal-container" ref={modalRef}>
				<div className="subject-modal-header">
					<h2 className="subject-modal-header-title">
						<FontAwesomeIcon
							icon={faBook}
							className="subject-modal-header-icon"
						/>
						{initialData
							? t("subjectModal.editSubject")
							: t("subjectModal.addNewSubject")}
					</h2>
					<button className="subject-modal-close-btn" onClick={onClose}>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<div className="subject-modal-body">
					<div className="subject-modal-form-group">
						<label htmlFor="subject-name" className="subject-modal-form-label">
							<FontAwesomeIcon
								icon={faBook}
								className="subject-modal-input-icon"
							/>
							{t("subjectModal.subjectName")}
						</label>
						<input
							id="subject-name"
							ref={nameInputRef}
							type="text"
							value={subjectName}
							onChange={(e) => {
								setSubjectName(e.target.value);
								if (e.target.value.trim()) {
									setNameError("");
								}
							}}
							placeholder={t("subjectModal.subjectNamePlaceholder")}
							className={
								nameError
									? "subject-modal-text-input subject-modal-text-input-error"
									: "subject-modal-text-input"
							}
						/>
						{nameError && (
							<div className="subject-modal-error-message">
								<FontAwesomeIcon icon={faInfoCircle} />
								<span>{nameError}</span>
							</div>
						)}
					</div>

					<div className="subject-modal-form-group">
						<div className="subject-modal-grades-header">
							<label className="subject-modal-form-label">
								<FontAwesomeIcon
									icon={faGraduationCap}
									className="subject-modal-input-icon"
								/>
								{t("subjectModal.gradeLevels")}
							</label>
							<div className="subject-modal-grade-actions">
								<button
									type="button"
									className="subject-modal-text-btn"
									onClick={selectAllGrades}
								>
									{t("subjectModal.selectAll")}
								</button>
								<button
									type="button"
									className="subject-modal-text-btn"
									onClick={clearAllGrades}
								>
									{t("subjectModal.clearAll")}
								</button>
							</div>
						</div>

						<div className="subject-modal-grades-grid">
							{[...Array(12)].map((_, index) => {
								const grade = index + 1;
								const isSelected = selectedGrades.includes(String(grade));
								return (
									<div
										key={grade}
										className={`subject-modal-grade-item ${
											isSelected ? "subject-modal-grade-item-selected" : ""
										}`}
										onClick={() => toggleGrade(grade)}
									>
										<span>{grade}</span>
									</div>
								);
							})}
						</div>

						<div className="subject-modal-selected-info">
							{selectedGrades.length > 0 ? (
								<p>
									<strong>{selectedGrades.length}</strong>{" "}
									{t("subjectModal.gradesSelected")}
								</p>
							) : (
								<p className="subject-modal-no-selection">
									{t("subjectModal.noGradesSelected")}
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="subject-modal-footer">
					<button className="subject-modal-cancel-btn" onClick={onClose}>
						{t("subjectModal.cancel")}
					</button>
					<button
						className={`subject-modal-save-btn ${
							!subjectName.trim() ? "subject-modal-save-btn-disabled" : ""
						}`}
						onClick={handleSave}
						disabled={!subjectName.trim()}
					>
						{initialData
							? t("subjectModal.updateSubject")
							: t("subjectModal.addSubject")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddEditSubjectModal;
