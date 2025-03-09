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

const TeacherEditModal = ({
	isOpen,
	teacher,
	subjects,
	departments,
	onClose,
	onSave,
}) => {
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
		<div className="modal-backdrop">
			<div className="modal-container">
				<header className="modal-header">
					<h2>
						{teacher
							? `${teacher.firstName} ${teacher.lastName}`
							: "Add New Teacher"}
					</h2>
					<button className="close-button" onClick={onClose}>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</header>

				<div className="modal-body">
					<div className="sidebar">
						<nav className="tab-navigation">
							<button
								className={`nav-item ${
									activeTab === "profile" ? "active" : ""
								}`}
								onClick={() => setActiveTab("profile")}
							>
								<span className="nav-icon">
									<FontAwesomeIcon icon={faUser} />
								</span>
								<span className="nav-text">Profile</span>
								{activeTab === "profile" && (
									<FontAwesomeIcon
										icon={faChevronRight}
										className="indicator"
									/>
								)}
							</button>

							<button
								className={`nav-item ${
									activeTab === "subjects" ? "active" : ""
								}`}
								onClick={() => setActiveTab("subjects")}
							>
								<span className="nav-icon">
									<FontAwesomeIcon icon={faUserShield} />
								</span>
								<span className="nav-text">Subject & Classes</span>
								{activeTab === "subjects" && (
									<FontAwesomeIcon
										icon={faChevronRight}
										className="indicator"
									/>
								)}
							</button>
						</nav>
					</div>

					<div className="content-area">
						{activeTab === "profile" && (
							<div className="profile-tab">
								<div className="form-section">
									<h3>Personal Information</h3>

									<div className="form-grid">
										<div className="form-field">
											<label htmlFor="firstName">First Name</label>
											<input
												type="text"
												id="firstName"
												name="firstName"
												value={teacherData.firstName}
												onChange={handleInputChange}
												placeholder="First Name"
											/>
										</div>

										<div className="form-field">
											<label htmlFor="lastName">Last Name</label>
											<input
												type="text"
												id="lastName"
												name="lastName"
												value={teacherData.lastName}
												onChange={handleInputChange}
												placeholder="Last Name"
											/>
										</div>

										<div className="form-field">
											<label htmlFor="email">Email Address</label>
											<input
												type="email"
												id="email"
												name="email"
												value={teacherData.email}
												onChange={handleInputChange}
												placeholder="email@school.edu"
											/>
										</div>

										<div className="form-field admin-toggle-container">
											<label>Administrator Access</label>
											<div className="admin-actions-row">
												<div className="toggle-switch-container">
													<label className="toggle-switch">
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
														<span className="toggle-slider"></span>
													</label>
													<span className="toggle-label">
														{teacherData.isAdmin ? "Admin" : "Teacher"}
													</span>
												</div>

												{teacher && (
													<button
														type="button"
														className="delete-teacher-btn"
														onClick={() => {
															if (
																window.confirm(
																	`Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}? This action cannot be undone.`
																)
															) {
																onClose();
																onSave({ id: teacher.id, _delete: true });
															}
														}}
													>
														<FontAwesomeIcon icon={faTrash} /> Delete
													</button>
												)}
											</div>
										</div>
									</div>
								</div>

								<div className="form-section">
									<h3>Security</h3>

									<div className="form-grid">
										<div className="form-field">
											<label htmlFor="loginPassword">Login Password</label>
											<div className="password-input">
												<input
													type={showLoginPassword ? "text" : "password"}
													id="loginPassword"
													name="loginPassword"
													value={teacherData.loginPassword}
													onChange={handleInputChange}
													placeholder={
														teacher
															? "Leave blank to keep current"
															: "New password"
													}
												/>
												<button
													type="button"
													className="toggle-password"
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

										<div className="form-field">
											<label htmlFor="gradePassword">
												Grade Access Password
											</label>
											<div className="password-input">
												<input
													type={showGradePassword ? "text" : "password"}
													id="gradePassword"
													name="gradePassword"
													value={teacherData.gradePassword}
													onChange={handleInputChange}
													placeholder={
														teacher
															? "Leave blank to keep current"
															: "New password"
													}
												/>
												<button
													type="button"
													className="toggle-password"
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
							<div className="subjects-tab">
								<div className="subject-columns">
									<div className="subject-list">
										<h3>Assigned Subjects</h3>

										<div className="subject-search">
											<select
												value={subjectToAdd}
												onChange={(e) => handleAddSubject(e.target.value)}
											>
												<option value="" disabled>
													+ Add Subject
												</option>
												{getAvailableSubjects().map((subject) => (
													<option key={subject.id} value={subject.id}>
														{subject.name}
													</option>
												))}
											</select>
										</div>

										<div className="assigned-subjects">
											{teacherData.subjects.length === 0 ? (
												<div className="no-subjects">
													<p>No subjects assigned yet</p>
												</div>
											) : (
												<ul className="subject-items">
													{teacherData.subjects.map((subject) => (
														<li
															key={subject.id}
															className={`subject-item ${
																selectedSubjectForEdit === subject.id
																	? "selected"
																	: ""
															}`}
															onClick={() =>
																setSelectedSubjectForEdit(subject.id)
															}
														>
															<div className="subject-info">
																<span className="subject-name">
																	{subject.name}
																</span>
																<span className="class-count">
																	{subject.classes.length} classes
																</span>
															</div>
															<div className="subject-actions">
																<button
																	className="remove-subject"
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

									<div className="class-selection">
										<h3>Assign Classes</h3>

										{selectedSubjectForEdit ? (
											<>
												<div className="selected-subject-header">
													<h4>
														{
															teacherData.subjects.find(
																(s) => s.id === selectedSubjectForEdit
															)?.name
														}
													</h4>
												</div>

												<div className="class-grid">
													{departments.map((department) => {
														const className = department.departmentName;
														const isSelected = teacherData.subjects
															.find((s) => s.id === selectedSubjectForEdit)
															?.classes.includes(className);

														return (
															<div
																key={department.id}
																className={`class-item ${
																	isSelected ? "selected" : ""
																}`}
																onClick={() =>
																	handleToggleClass(
																		selectedSubjectForEdit,
																		className
																	)
																}
															>
																<span className="class-name">{className}</span>
																{isSelected && (
																	<FontAwesomeIcon
																		icon={faCheck}
																		className="class-check"
																	/>
																)}
															</div>
														);
													})}
												</div>
											</>
										) : (
											<div className="no-subject-selected">
												<p>Select a subject to assign classes</p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				<footer className="modal-footer">
					<button className="cancel-button" onClick={onClose}>
						Cancel
					</button>
					<button className="save-button" onClick={handleSubmit}>
						Save Changes
					</button>
				</footer>
			</div>
		</div>
	);
};

export default TeacherEditModal;
