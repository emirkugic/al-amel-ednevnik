import React, { useState, useEffect } from "react";
import "./TeacherEditModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTimes,
	faUserShield,
	faUser,
	faEye,
	faEyeSlash,
	faPlus,
	faMinus,
	faCheck,
	faChevronRight,
	faToggleOn,
	faToggleOff,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../../../contexts/LanguageContext";

const TeacherEditModal = ({
	isOpen,
	teacher,
	subjects,
	departments,
	onClose,
	onSave,
}) => {
	const { t } = useLanguage();
	const [activeTab, setActiveTab] = useState("profile");
	const [teacherData, setTeacherData] = useState({
		id: null,
		firstName: "",
		lastName: "",
		email: "",
		loginPassword: "",
		gradePassword: "",
		isAdmin: false,
		subjects: [],
	});

	// Track subject changes for API updates
	const [subjectUpdates, setSubjectUpdates] = useState({
		add: [], // Format: {subjectId, departmentId: []}
		remove: [], // Format: subjectId
	});

	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showGradePassword, setShowGradePassword] = useState(false);
	const [subjectToAdd, setSubjectToAdd] = useState("");
	const [selectedSubjectForEdit, setSelectedSubjectForEdit] = useState(null);
	const [departmentSelection, setDepartmentSelection] = useState([]);

	// Initialize form when teacher data changes
	useEffect(() => {
		if (teacher) {
			// Transform assigned subjects to match UI format
			const transformedSubjects = [];

			// Ensure we handle the case where assignedSubjects might be null
			if (teacher.assignedSubjects && Array.isArray(teacher.assignedSubjects)) {
				teacher.assignedSubjects.forEach((assignment) => {
					const subject = subjects.find((s) => s.id === assignment.subjectId);

					if (subject) {
						// Ensure departmentId is treated as an array
						const departmentIdArray = Array.isArray(assignment.departmentId)
							? assignment.departmentId
							: [assignment.departmentId];

						// Convert department IDs to department names
						const classes = departmentIdArray.map((depId) => {
							const department = departments.find((d) => d.id === depId);
							return department ? department.departmentName : depId;
						});

						transformedSubjects.push({
							id: subject.id,
							name: subject.name,
							classes: classes,
							// Keep original department IDs for API calls
							departmentIds: departmentIdArray,
						});
					}
				});
			}

			setTeacherData({
				id: teacher.id,
				firstName: teacher.firstName,
				lastName: teacher.lastName,
				email: teacher.email,
				loginPassword: "", // Don't show current password
				gradePassword: "",
				isAdmin: teacher.isAdmin || false,
				subjects: transformedSubjects,
			});

			// Reset subject updates
			setSubjectUpdates({
				add: [],
				remove: [],
			});
		} else {
			// Reset form for new teacher
			setTeacherData({
				id: null,
				firstName: "",
				lastName: "",
				email: "",
				loginPassword: "", // Required for new teachers
				gradePassword: "",
				isAdmin: false,
				subjects: [], // Initialize with empty array, not null
			});
		}

		// Reset other state
		setSubjectToAdd("");
		setSelectedSubjectForEdit(null);
		setDepartmentSelection([]);
		setActiveTab("profile");
	}, [teacher, subjects, departments]);

	// Get subjects that aren't already assigned
	const getAvailableSubjects = () => {
		return subjects.filter(
			(subject) => !teacherData.subjects.some((s) => s.id === subject.id)
		);
	};

	// Handle adding a new subject
	const handleAddSubject = (subjectId) => {
		const subjectId_value = subjectId;
		const subject = subjects.find((s) => s.id === subjectId_value);
		if (!subject) return;

		// Add subject to teacherData
		setTeacherData((prev) => ({
			...prev,
			subjects: [
				...prev.subjects,
				{
					id: subject.id,
					name: subject.name,
					classes: [],
					departmentIds: [], // Store original IDs for API
				},
			],
		}));

		setSubjectToAdd("");

		// Select the newly added subject
		setSelectedSubjectForEdit(subject.id);
	};

	// Handle removing a subject
	const handleRemoveSubject = (subjectId) => {
		// Add to removal list for API
		setSubjectUpdates((prev) => ({
			...prev,
			remove: [...prev.remove, subjectId],
		}));

		// Remove from UI
		setTeacherData((prev) => ({
			...prev,
			subjects: prev.subjects.filter((s) => s.id !== subjectId),
		}));

		if (selectedSubjectForEdit === subjectId) {
			setSelectedSubjectForEdit(null);
		}
	};

	// Handle toggling class/department selection for a subject
	const handleToggleClass = (subjectId, className) => {
		// Find the department ID for this class name
		const department = departments.find((d) => d.departmentName === className);
		if (!department) return;

		const departmentId = department.id;

		setTeacherData((prev) => {
			// Find the subject
			const subjectIndex = prev.subjects.findIndex((s) => s.id === subjectId);
			if (subjectIndex === -1) return prev;

			const subject = prev.subjects[subjectIndex];

			// Check if class is already assigned
			const hasClass = subject.classes.includes(className);

			// Update department IDs
			let departmentIds = [...subject.departmentIds];
			if (hasClass) {
				// Remove department ID
				departmentIds = departmentIds.filter((id) => id !== departmentId);
			} else {
				// Add department ID
				departmentIds.push(departmentId);
			}

			// Update classes
			const classes = hasClass
				? subject.classes.filter((c) => c !== className)
				: [...subject.classes, className].sort();

			// Create updated subject
			const updatedSubject = {
				...subject,
				classes,
				departmentIds,
			};

			// Create updated subjects array
			const updatedSubjects = [...prev.subjects];
			updatedSubjects[subjectIndex] = updatedSubject;

			// Update subject additions for API
			const isNewSubject =
				!teacher ||
				!teacher.assignedSubjects ||
				!teacher.assignedSubjects.some((as) => as.subjectId === subjectId);

			if (isNewSubject) {
				// This is a new subject - handle it differently when saving
				setSubjectUpdates((updates) => {
					// Find if we already have an update for this subject
					const existingIndex = updates.add.findIndex(
						(s) => s.subjectId === subjectId
					);

					if (existingIndex >= 0) {
						// Update existing entry
						const updatedAdds = [...updates.add];
						updatedAdds[existingIndex] = {
							subjectId,
							departmentId: departmentIds,
						};
						return {
							...updates,
							add: updatedAdds,
						};
					} else {
						// Add new entry
						return {
							...updates,
							add: [
								...updates.add,
								{
									subjectId,
									departmentId: departmentIds,
								},
							],
						};
					}
				});
			}

			return {
				...prev,
				subjects: updatedSubjects,
			};
		});
	};

	// Handle input changes
	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setTeacherData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	// Handle form submission
	const handleSubmit = () => {
		// Create a copy of the teacher data
		const dataToSave = { ...teacherData };

		// Only include passwords if they're non-empty
		if (!dataToSave.loginPassword) {
			delete dataToSave.loginPassword;
		}

		if (!dataToSave.gradePassword) {
			delete dataToSave.gradePassword;
		}

		// Include subject updates if there are any
		if (subjectUpdates.add.length > 0 || subjectUpdates.remove.length > 0) {
			dataToSave.subjectUpdates = subjectUpdates;
		}

		onSave(dataToSave);
	};

	if (!isOpen) return null;

	return (
		<div className="tem-modal-backdrop">
			<div className="tem-modal-container">
				<header className="tem-modal-header">
					<h2>
						{teacher
							? `${teacher.firstName} ${teacher.lastName}`
							: t("teacherModal.addNewTeacher")}
					</h2>
					<button className="tem-close-button" onClick={onClose}>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</header>

				<div className="tem-modal-body">
					<div className="tem-sidebar">
						<nav className="tem-tab-navigation">
							<button
								className={`tem-nav-item ${
									activeTab === "profile" ? "tem-active" : ""
								}`}
								onClick={() => setActiveTab("profile")}
							>
								<span className="tem-nav-icon">
									<FontAwesomeIcon icon={faUser} />
								</span>
								<span className="tem-nav-text">
									{t("teacherModal.profile")}
								</span>
								{activeTab === "profile" && (
									<FontAwesomeIcon
										icon={faChevronRight}
										className="tem-indicator"
									/>
								)}
							</button>

							<button
								className={`tem-nav-item ${
									activeTab === "subjects" ? "tem-active" : ""
								}`}
								onClick={() => setActiveTab("subjects")}
							>
								<span className="tem-nav-icon">
									<FontAwesomeIcon icon={faUserShield} />
								</span>
								<span className="tem-nav-text">
									{t("teacherModal.subjectsAndClasses")}
								</span>
								{activeTab === "subjects" && (
									<FontAwesomeIcon
										icon={faChevronRight}
										className="tem-indicator"
									/>
								)}
							</button>
						</nav>
					</div>

					<div className="tem-content-area">
						{activeTab === "profile" && (
							<div className="tem-profile-tab">
								<div className="tem-form-section">
									<h3>{t("teacherModal.personalInformation")}</h3>

									<div className="tem-form-grid">
										<div className="tem-form-field">
											<label htmlFor="firstName">
												{t("teacherModal.firstName")}
											</label>
											<input
												type="text"
												id="firstName"
												name="firstName"
												value={teacherData.firstName}
												onChange={handleInputChange}
												placeholder={t("teacherModal.firstName")}
											/>
										</div>

										<div className="tem-form-field">
											<label htmlFor="lastName">
												{t("teacherModal.lastName")}
											</label>
											<input
												type="text"
												id="lastName"
												name="lastName"
												value={teacherData.lastName}
												onChange={handleInputChange}
												placeholder={t("teacherModal.lastName")}
											/>
										</div>

										<div className="tem-form-field">
											<label htmlFor="email">
												{t("teacherModal.emailAddress")}
											</label>
											<input
												type="email"
												id="email"
												name="email"
												value={teacherData.email}
												onChange={handleInputChange}
												placeholder="email@school.edu"
											/>
										</div>

										<div className="tem-form-field tem-admin-toggle-container">
											<label>{t("teacherModal.administratorAccess")}</label>
											<div className="tem-admin-actions-row">
												<div className="tem-toggle-switch-container">
													<label className="tem-toggle-switch">
														<input
															type="checkbox"
															checked={teacherData.isAdmin}
															onChange={() =>
																setTeacherData((prev) => ({
																	...prev,
																	isAdmin: !prev.isAdmin,
																}))
															}
														/>
														<span className="tem-toggle-slider"></span>
													</label>
													<span className="tem-toggle-label">
														{teacherData.isAdmin
															? t("teacherModal.admin")
															: t("teacherModal.teacher")}
													</span>
												</div>

												{teacher && (
													<button
														type="button"
														className="tem-delete-teacher-btn"
														onClick={() => {
															if (
																window.confirm(
																	t("teacherModal.deleteConfirmation")
																)
															) {
																onClose();
																onSave({ id: teacher.id, _delete: true });
															}
														}}
													>
														<FontAwesomeIcon icon={faTrash} />{" "}
														{t("teacherModal.delete")}
													</button>
												)}
											</div>
										</div>
									</div>
								</div>

								<div className="tem-form-section">
									<h3>{t("teacherModal.security")}</h3>

									<div className="tem-form-grid">
										<div className="tem-form-field">
											<label htmlFor="loginPassword">
												{t("teacherModal.loginPassword")}
											</label>
											<div className="tem-password-input">
												<input
													type={showLoginPassword ? "text" : "password"}
													id="loginPassword"
													name="loginPassword"
													value={teacherData.loginPassword}
													onChange={handleInputChange}
													placeholder={
														teacher
															? t("teacherModal.leaveBlankToKeepCurrent")
															: t("teacherModal.newPassword")
													}
												/>
												<button
													type="button"
													className="tem-toggle-password"
													onClick={() =>
														setShowLoginPassword(!showLoginPassword)
													}
													aria-label={
														showLoginPassword
															? "Hide password"
															: "Show password"
													}
												>
													<FontAwesomeIcon
														icon={showLoginPassword ? faEyeSlash : faEye}
													/>
												</button>
											</div>
										</div>

										<div className="tem-form-field">
											<label htmlFor="gradePassword">
												{t("teacherModal.gradeAccessPassword")}
											</label>
											<div className="tem-password-input">
												<input
													type={showGradePassword ? "text" : "password"}
													id="gradePassword"
													name="gradePassword"
													value={teacherData.gradePassword}
													onChange={handleInputChange}
													placeholder={
														teacher
															? t("teacherModal.leaveBlankToKeepCurrent")
															: t("teacherModal.newPassword")
													}
												/>
												<button
													type="button"
													className="tem-toggle-password"
													onClick={() =>
														setShowGradePassword(!showGradePassword)
													}
													aria-label={
														showGradePassword
															? "Hide password"
															: "Show password"
													}
												>
													<FontAwesomeIcon
														icon={showGradePassword ? faEyeSlash : faEye}
													/>
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "subjects" && (
							<div className="tem-subjects-tab">
								<div className="tem-subject-columns">
									<div className="tem-subject-list">
										<h3>{t("teacherModal.assignedSubjects")}</h3>

										<div className="tem-subject-search">
											<select
												value={subjectToAdd}
												onChange={(e) => handleAddSubject(e.target.value)}
											>
												<option value="" disabled>
													+ {t("teacherModal.addSubject")}
												</option>
												{getAvailableSubjects().map((subject) => (
													<option key={subject.id} value={subject.id}>
														{subject.name}
													</option>
												))}
											</select>
										</div>

										<div className="tem-assigned-subjects">
											{teacherData.subjects.length === 0 ? (
												<div className="tem-no-subjects">
													<p>{t("teacherModal.noSubjectsAssigned")}</p>
												</div>
											) : (
												<ul className="tem-subject-items">
													{teacherData.subjects.map((subject) => (
														<li
															key={subject.id}
															className={`tem-subject-item ${
																selectedSubjectForEdit === subject.id
																	? "tem-selected"
																	: ""
															}`}
															onClick={() =>
																setSelectedSubjectForEdit(subject.id)
															}
														>
															<div className="tem-subject-info">
																<span className="tem-subject-name">
																	{subject.name}
																</span>
																<span className="tem-class-count">
																	{subject.classes.length}{" "}
																	{t("teacherModal.classes")}
																</span>
															</div>
															<div className="tem-subject-actions">
																<button
																	className="tem-remove-subject"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleRemoveSubject(subject.id);
																	}}
																>
																	<FontAwesomeIcon icon={faMinus} />
																</button>
															</div>
														</li>
													))}
												</ul>
											)}
										</div>
									</div>

									<div className="tem-class-selection">
										<h3>{t("teacherModal.assignClasses")}</h3>

										{selectedSubjectForEdit ? (
											<>
												<div className="tem-selected-subject-header">
													<h4>
														{
															teacherData.subjects.find(
																(s) => s.id === selectedSubjectForEdit
															)?.name
														}
													</h4>
												</div>

												<div className="tem-class-grid">
													{departments.map((department) => {
														const className = department.departmentName;
														const isSelected = teacherData.subjects
															.find((s) => s.id === selectedSubjectForEdit)
															?.classes.includes(className);

														return (
															<div
																key={department.id}
																className={`tem-class-item ${
																	isSelected ? "tem-selected" : ""
																}`}
																onClick={() =>
																	handleToggleClass(
																		selectedSubjectForEdit,
																		className
																	)
																}
															>
																<span className="tem-class-name">
																	{className}
																</span>
																{isSelected && (
																	<FontAwesomeIcon
																		icon={faCheck}
																		className="tem-class-check"
																	/>
																)}
															</div>
														);
													})}
												</div>
											</>
										) : (
											<div className="tem-no-subject-selected">
												<p>{t("teacherModal.selectSubjectToAssign")}</p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				<footer className="tem-modal-footer">
					<button className="tem-cancel-button" onClick={onClose}>
						{t("teacherModal.cancel")}
					</button>
					<button className="tem-save-button" onClick={handleSubmit}>
						{t("teacherModal.saveChanges")}
					</button>
				</footer>
			</div>
		</div>
	);
};

export default TeacherEditModal;
