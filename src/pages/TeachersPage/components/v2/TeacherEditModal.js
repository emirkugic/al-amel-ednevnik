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
} from "@fortawesome/free-solid-svg-icons";

// Mock data - replace with API calls in production
const AVAILABLE_SUBJECTS = [
	{ id: 1, name: "Physics" },
	{ id: 2, name: "Advanced Mathematics" },
	{ id: 3, name: "Algebra" },
	{ id: 4, name: "Calculus" },
	{ id: 5, name: "English Literature" },
	{ id: 6, name: "Creative Writing" },
	{ id: 7, name: "Public Speaking" },
	{ id: 8, name: "History" },
	{ id: 9, name: "Geography" },
	{ id: 10, name: "Biology" },
	{ id: 11, name: "Chemistry" },
];

const AVAILABLE_CLASSES = [
	"9A",
	"9B",
	"9C",
	"10A",
	"10B",
	"10C",
	"11A",
	"11B",
	"12A",
	"12B",
	"12C",
];

const TeacherEditModal = ({ isOpen, teacher, onClose, onSave }) => {
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

	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showGradePassword, setShowGradePassword] = useState(false);
	const [subjectToAdd, setSubjectToAdd] = useState("");
	const [selectedSubjectForEdit, setSelectedSubjectForEdit] = useState(null);

	// Initialize form when teacher data changes
	useEffect(() => {
		if (teacher) {
			// Split name into first and last
			const nameParts = teacher.name.split(" ");
			const lastName = nameParts.pop();
			const firstName = nameParts.join(" ");

			setTeacherData({
				id: teacher.id,
				firstName: firstName,
				lastName: lastName,
				email: teacher.email,
				loginPassword: "", // Assume passwords aren't sent to frontend
				gradePassword: "",
				isAdmin: teacher.isAdmin,
				subjects: teacher.subjects || [],
			});
		}
	}, [teacher]);

	// Get subjects that aren't already assigned
	const getAvailableSubjects = () => {
		return AVAILABLE_SUBJECTS.filter(
			(subject) => !teacherData.subjects.some((s) => s.id === subject.id)
		);
	};

	// Handle adding a new subject
	const handleAddSubject = (subjectId) => {
		const subjectId_num = parseInt(subjectId, 10);
		const subject = AVAILABLE_SUBJECTS.find((s) => s.id === subjectId_num);
		if (!subject) return;

		setTeacherData((prev) => ({
			...prev,
			subjects: [
				...prev.subjects,
				{ id: subject.id, name: subject.name, classes: [] },
			],
		}));

		setSubjectToAdd("");
	};

	// Handle removing a subject
	const handleRemoveSubject = (subjectId) => {
		setTeacherData((prev) => ({
			...prev,
			subjects: prev.subjects.filter((s) => s.id !== subjectId),
		}));

		if (selectedSubjectForEdit === subjectId) {
			setSelectedSubjectForEdit(null);
		}
	};

	// Handle toggling class selection for a subject
	const handleToggleClass = (subjectId, className) => {
		setTeacherData((prev) => ({
			...prev,
			subjects: prev.subjects.map((subject) => {
				if (subject.id === subjectId) {
					const hasClass = subject.classes.includes(className);
					return {
						...subject,
						classes: hasClass
							? subject.classes.filter((c) => c !== className)
							: [...subject.classes, className].sort(),
					};
				}
				return subject;
			}),
		}));
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
		// Combine first and last name before saving
		const fullTeacherData = {
			...teacherData,
			name: `${teacherData.firstName} ${teacherData.lastName}`.trim(),
		};

		onSave(fullTeacherData);
	};

	if (!isOpen) return null;

	return (
		<div className="modal-backdrop">
			<div className="modal-container">
				<header className="modal-header">
					<h2>{teacher ? `${teacher.name}` : "Add New Teacher"}</h2>
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
												value=""
												onChange={(e) =>
													handleAddSubject(parseInt(e.target.value))
												}
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
													{AVAILABLE_CLASSES.map((className) => {
														const isSelected = teacherData.subjects
															.find((s) => s.id === selectedSubjectForEdit)
															?.classes.includes(className);

														return (
															<div
																key={className}
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
