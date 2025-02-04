import React, { useState, useEffect } from "react";
import "./TeacherManagement.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPlus,
	faPen,
	faTrash,
	faChalkboardTeacher,
	faBook,
	faMinusCircle,
} from "@fortawesome/free-solid-svg-icons";

import useAuth from "../../../hooks/useAuth";
import teacherApi from "../../../api/teacherApi";
import subjectApi from "../../../api/subjectApi";
import departmentApi from "../../../api/departmentApi";

const TeacherManagement = () => {
	const { user } = useAuth();
	const token = user?.token;

	// ======================
	// State
	// ======================
	const [teachers, setTeachers] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [departments, setDepartments] = useState([]);

	// For searching/filtering teachers
	const [searchTerm, setSearchTerm] = useState("");

	// Teacher Modal (Add/Edit)
	const [showTeacherModal, setShowTeacherModal] = useState(false);
	const [currentTeacher, setCurrentTeacher] = useState(null); // if editing
	const [teacherFormData, setTeacherFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		loginPassword: "",
		gradePassword: "",
		isAdmin: false,
	});

	// Subject Management Modal
	const [showSubjectModal, setShowSubjectModal] = useState(false);
	const [subjectTeacher, setSubjectTeacher] = useState(null); // teacher to manage subjects for
	const [subjectId, setSubjectId] = useState("");
	const [departmentSelection, setDepartmentSelection] = useState([]);

	// ======================
	// Fetch Data
	// ======================
	useEffect(() => {
		if (!token) return;
		(async () => {
			try {
				// Teachers
				const teacherData = await teacherApi.getAllTeachers(token);
				setTeachers(teacherData);

				// Subjects
				const subjectData = await subjectApi.getAllSubjects(token);
				setSubjects(subjectData);

				// Departments
				const departmentData = await departmentApi.getAllDepartments(token);
				setDepartments(departmentData);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		})();
	}, [token]);

	// ======================
	// Teacher CRUD
	// ======================
	const openAddTeacherModal = () => {
		setCurrentTeacher(null);
		setTeacherFormData({
			firstName: "",
			lastName: "",
			email: "",
			loginPassword: "",
			gradePassword: "",
			isAdmin: false,
		});
		setShowTeacherModal(true);
	};

	const openEditTeacherModal = (teacher) => {
		setCurrentTeacher(teacher);
		setTeacherFormData({
			firstName: teacher.firstName,
			lastName: teacher.lastName,
			email: teacher.email,
			loginPassword: teacher.loginPassword,
			gradePassword: teacher.gradePassword || "",
			isAdmin: teacher.isAdmin || false,
		});
		setShowTeacherModal(true);
	};

	const closeTeacherModal = () => {
		setShowTeacherModal(false);
	};

	const handleTeacherFormChange = (e) => {
		const { name, value, type, checked } = e.target;
		setTeacherFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const saveTeacher = async () => {
		try {
			if (currentTeacher) {
				// Update existing
				const updated = await teacherApi.updateTeacher(
					currentTeacher.id,
					teacherFormData,
					token
				);
				setTeachers((prev) =>
					prev.map((t) => (t.id === currentTeacher.id ? updated : t))
				);
			} else {
				// Create new
				const created = await teacherApi.createTeacher(teacherFormData, token);
				setTeachers((prev) => [...prev, created]);
			}
		} catch (error) {
			console.error("Error saving teacher:", error);
		} finally {
			closeTeacherModal();
		}
	};

	const deleteTeacher = async (teacherId) => {
		if (!window.confirm("Are you sure you want to delete this teacher?"))
			return;
		try {
			await teacherApi.deleteTeacher(teacherId, token);
			setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
		} catch (error) {
			console.error("Error deleting teacher:", error);
		}
	};

	// ======================
	// Subject Management
	// ======================
	const openSubjectModal = (teacher) => {
		setSubjectTeacher(teacher);
		setSubjectId("");
		setDepartmentSelection([]);
		setShowSubjectModal(true);
	};

	const closeSubjectModal = () => {
		setShowSubjectModal(false);
	};

	const handleAddSubjectToTeacher = async () => {
		if (!subjectId || departmentSelection.length === 0) {
			alert("Please select a Subject and at least one Department.");
			return;
		}
		try {
			const assignedSubject = {
				subjectId,
				departmentId: departmentSelection,
			};
			const updatedTeacher = await teacherApi.addSubjectToTeacher(
				subjectTeacher.id,
				assignedSubject,
				token
			);
			// Update local state
			setTeachers((prev) =>
				prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
			);
			// Also update the local subjectTeacher so the UI matches
			setSubjectTeacher(updatedTeacher);
			// Reset
			setSubjectId("");
			setDepartmentSelection([]);
		} catch (error) {
			console.error("Error adding subject:", error);
		}
	};

	const handleRemoveSubjectFromTeacher = async (subjectIdToRemove) => {
		try {
			const updatedTeacher = await teacherApi.removeSubjectFromTeacher(
				subjectTeacher.id,
				subjectIdToRemove,
				token
			);
			// Update local state
			setTeachers((prev) =>
				prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
			);
			setSubjectTeacher(updatedTeacher);
		} catch (error) {
			console.error("Error removing subject:", error);
		}
	};

	const handleDepartmentCheck = (depId) => {
		setDepartmentSelection((prev) =>
			prev.includes(depId) ? prev.filter((d) => d !== depId) : [...prev, depId]
		);
	};

	// ======================
	// Filtered Teachers
	// ======================
	const filteredTeachers = teachers.filter((t) => {
		const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
		return fullName.includes(searchTerm.toLowerCase());
	});

	// ======================
	// Rendering
	// ======================
	if (!token) {
		return <div>Loading...</div>;
	}

	// Helper to get subject & department names from their IDs
	const getSubjectName = (subId) => {
		const sub = subjects.find((s) => s.id === subId);
		return sub ? sub.name : subId;
	};

	const getDepartmentNames = (depIds) => {
		const names = depIds.map((id) => {
			const found = departments.find((d) => d.id === id);
			return found ? found.departmentName : id;
		});
		return names.join(", ");
	};

	return (
		<div className="teacher-management-container">
			<div className="teacher-management-header">
				<h2>
					<FontAwesomeIcon icon={faChalkboardTeacher} /> Teacher Management
				</h2>
				<p>
					Manage your school's teachers, their details, and assigned subjects.
				</p>
				<button className="btn primary-btn" onClick={openAddTeacherModal}>
					<FontAwesomeIcon icon={faPlus} /> Add Teacher
				</button>
			</div>

			<div className="search-bar">
				<input
					type="text"
					placeholder="Search by teacher name..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			<table className="teacher-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Subjects Assigned</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{filteredTeachers.map((teacher) => (
						<tr key={teacher.id}>
							<td>
								{teacher.firstName} {teacher.lastName}{" "}
								{teacher.isAdmin && <span className="admin-badge">Admin</span>}
							</td>
							<td>{teacher.email}</td>
							<td style={{ width: "35%" }}>
								{teacher.assignedSubjects &&
								teacher.assignedSubjects.length > 0 ? (
									<ul className="assigned-subjects-list-compact">
										{teacher.assignedSubjects.map((as) => {
											const subjectName = getSubjectName(as.subjectId);
											const deptNames = getDepartmentNames(as.departmentId);
											return (
												<li key={as.subjectId}>
													<FontAwesomeIcon
														icon={faBook}
														className="icon-small"
													/>
													<strong>{subjectName}</strong>
													{" — "}
													<span className="dept-info">{deptNames}</span>
												</li>
											);
										})}
									</ul>
								) : (
									<span style={{ color: "#999" }}>No subjects</span>
								)}
							</td>
							<td>
								<button
									className="btn small-btn info-btn"
									onClick={() => openSubjectModal(teacher)}
								>
									Manage Subjects
								</button>
								<button
									className="btn small-btn edit-btn"
									onClick={() => openEditTeacherModal(teacher)}
								>
									<FontAwesomeIcon icon={faPen} />
								</button>
								<button
									className="btn small-btn delete-btn"
									onClick={() => deleteTeacher(teacher.id)}
								>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							</td>
						</tr>
					))}
					{filteredTeachers.length === 0 && (
						<tr>
							<td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
								No teachers found.
							</td>
						</tr>
					)}
				</tbody>
			</table>

			{/* =====================
          Add/Edit Teacher Modal
      ====================== */}
			{showTeacherModal && (
				<div className="modal-overlay">
					<div className="modal-content">
						<h3>{currentTeacher ? "Edit Teacher" : "Add Teacher"}</h3>
						<div className="form-group">
							<label>First Name</label>
							<input
								name="firstName"
								value={teacherFormData.firstName}
								onChange={handleTeacherFormChange}
							/>
						</div>
						<div className="form-group">
							<label>Last Name</label>
							<input
								name="lastName"
								value={teacherFormData.lastName}
								onChange={handleTeacherFormChange}
							/>
						</div>
						<div className="form-group">
							<label>Email</label>
							<input
								name="email"
								value={teacherFormData.email}
								onChange={handleTeacherFormChange}
							/>
						</div>
						<div className="form-group">
							<label>Login Password</label>
							<input
								type="password"
								name="loginPassword"
								value={teacherFormData.loginPassword}
								onChange={handleTeacherFormChange}
							/>
						</div>
						<div className="form-group">
							<label>Grade Password</label>
							<input
								type="password"
								name="gradePassword"
								value={teacherFormData.gradePassword}
								onChange={handleTeacherFormChange}
							/>
						</div>
						<div className="form-group checkbox-group">
							<label htmlFor="isAdmin">Is Admin?</label>
							<input
								id="isAdmin"
								name="isAdmin"
								type="checkbox"
								checked={teacherFormData.isAdmin}
								onChange={handleTeacherFormChange}
							/>
						</div>
						<div className="modal-actions">
							<button className="btn primary-btn" onClick={saveTeacher}>
								Save
							</button>
							<button className="btn secondary-btn" onClick={closeTeacherModal}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* =====================
          Manage Subjects Modal
      ====================== */}
			{showSubjectModal && subjectTeacher && (
				<div className="modal-overlay">
					<div className="modal-content modal-subject">
						<h3>
							Manage Subjects for {subjectTeacher.firstName}{" "}
							{subjectTeacher.lastName}
						</h3>
						<div className="assigned-subjects-list">
							<h4>Currently Assigned Subjects:</h4>
							{subjectTeacher.assignedSubjects &&
							subjectTeacher.assignedSubjects.length > 0 ? (
								<ul>
									{subjectTeacher.assignedSubjects.map((as) => {
										const subjectName = getSubjectName(as.subjectId);
										const deptNames = getDepartmentNames(as.departmentId);
										return (
											<li key={as.subjectId} className="assigned-subject-item">
												<FontAwesomeIcon icon={faBook} />{" "}
												<strong>{subjectName}</strong>
												{" — "}
												<span className="dept-info">{deptNames}</span>
												<button
													className="remove-subject-btn"
													onClick={() =>
														handleRemoveSubjectFromTeacher(as.subjectId)
													}
												>
													<FontAwesomeIcon icon={faMinusCircle} />
												</button>
											</li>
										);
									})}
								</ul>
							) : (
								<p>No subjects assigned yet.</p>
							)}
						</div>
						<div className="add-subject-form">
							<h4>Add New Subject:</h4>
							<div className="form-group">
								<label>Select Subject</label>
								<select
									value={subjectId}
									onChange={(e) => setSubjectId(e.target.value)}
								>
									<option value="">-- Select Subject --</option>
									{subjects.map((sub) => (
										<option key={sub.id} value={sub.id}>
											{sub.name}
										</option>
									))}
								</select>
							</div>
							<div className="form-group">
								<label>Departments</label>
								<div className="departments-grid">
									{departments.map((dep) => (
										<label key={dep.id} className="dept-checkbox">
											<input
												type="checkbox"
												value={dep.id}
												checked={departmentSelection.includes(dep.id)}
												onChange={() => handleDepartmentCheck(dep.id)}
											/>
											{dep.departmentName}
										</label>
									))}
								</div>
							</div>
							<button
								className="btn primary-btn"
								onClick={handleAddSubjectToTeacher}
							>
								Add Subject
							</button>
						</div>
						<div className="modal-actions">
							<button className="btn secondary-btn" onClick={closeSubjectModal}>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TeacherManagement;
