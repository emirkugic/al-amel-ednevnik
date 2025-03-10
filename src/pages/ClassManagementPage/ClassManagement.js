import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPlus,
	faTrashAlt,
	faTimes,
	faUser,
	faEdit,
	faGraduationCap,
	faChalkboardTeacher,
	faBook,
	faSave,
} from "@fortawesome/free-solid-svg-icons";
import "./ClassManagement.css";

const ClassManagement = () => {
	// State for classes, teachers, and subjects
	const [classes, setClasses] = useState([]);
	const [teachers] = useState([
		{ id: 1, name: "John Doe" },
		{ id: 2, name: "Jane Smith" },
		{ id: 3, name: "Robert Johnson" },
		{ id: 4, name: "Mary Williams" },
		{ id: 5, name: "David Brown" },
	]);
	const [subjects] = useState([
		{ id: 1, name: "Mathematics" },
		{ id: 2, name: "Science" },
		{ id: 3, name: "English" },
		{ id: 4, name: "History" },
		{ id: 5, name: "Geography" },
		{ id: 6, name: "Computer Science" },
		{ id: 7, name: "Physical Education" },
		{ id: 8, name: "Art" },
	]);

	// State for modals and forms
	const [showClassModal, setShowClassModal] = useState(false);
	const [showDepartmentModal, setShowDepartmentModal] = useState(false);
	const [showEditClassModal, setShowEditClassModal] = useState(false);
	const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);

	const [selectedClassForDept, setSelectedClassForDept] = useState(null);
	const [classToEdit, setClassToEdit] = useState(null);
	const [departmentToEdit, setDepartmentToEdit] = useState(null);
	const [departmentParentClass, setDepartmentParentClass] = useState(null);

	const [newGrade, setNewGrade] = useState("");
	const [selectedSubjects, setSelectedSubjects] = useState([]);
	const [newDepartmentName, setNewDepartmentName] = useState("");
	const [selectedTeacher, setSelectedTeacher] = useState("");

	// Edit form state
	const [editGrade, setEditGrade] = useState("");
	const [editSubjects, setEditSubjects] = useState([]);
	const [editDepartmentName, setEditDepartmentName] = useState("");
	const [editTeacher, setEditTeacher] = useState("");

	// Handler for creating a new class
	const handleCreateClass = () => {
		if (newGrade && selectedSubjects.length > 0) {
			const newClass = {
				id: Date.now(),
				grade: newGrade,
				subjects: selectedSubjects.map((id) => {
					const subject = subjects.find((s) => s.id === id);
					return { id: subject.id, name: subject.name };
				}),
				departments: [],
			};
			setClasses([...classes, newClass]);
			setNewGrade("");
			setSelectedSubjects([]);
			setShowClassModal(false);
		}
	};

	// Handler for editing a class
	const handleEditClass = () => {
		if (classToEdit && editGrade && editSubjects.length > 0) {
			setClasses(
				classes.map((cls) => {
					if (cls.id === classToEdit.id) {
						return {
							...cls,
							grade: editGrade,
							subjects: editSubjects.map((id) => {
								const subject = subjects.find((s) => s.id === id);
								return { id: subject.id, name: subject.name };
							}),
						};
					}
					return cls;
				})
			);

			setClassToEdit(null);
			setEditGrade("");
			setEditSubjects([]);
			setShowEditClassModal(false);
		}
	};

	// Handler for creating a new department
	const handleCreateDepartment = () => {
		if (selectedClassForDept && newDepartmentName && selectedTeacher) {
			const teacherObj = teachers.find(
				(t) => t.id.toString() === selectedTeacher.toString()
			);
			const newDepartment = {
				id: Date.now(),
				name: newDepartmentName,
				teacherId: teacherObj.id,
				teacherName: teacherObj.name,
			};

			setClasses(
				classes.map((cls) => {
					if (cls.id === selectedClassForDept.id) {
						return {
							...cls,
							departments: [...cls.departments, newDepartment],
						};
					}
					return cls;
				})
			);

			setNewDepartmentName("");
			setSelectedTeacher("");
			setShowDepartmentModal(false);
		}
	};

	// Handler for editing a department
	const handleEditDepartment = () => {
		if (
			departmentToEdit &&
			departmentParentClass &&
			editDepartmentName &&
			editTeacher
		) {
			const teacherObj = teachers.find(
				(t) => t.id.toString() === editTeacher.toString()
			);

			setClasses(
				classes.map((cls) => {
					if (cls.id === departmentParentClass.id) {
						return {
							...cls,
							departments: cls.departments.map((dept) => {
								if (dept.id === departmentToEdit.id) {
									return {
										...dept,
										name: editDepartmentName,
										teacherId: teacherObj.id,
										teacherName: teacherObj.name,
									};
								}
								return dept;
							}),
						};
					}
					return cls;
				})
			);

			setDepartmentToEdit(null);
			setDepartmentParentClass(null);
			setEditDepartmentName("");
			setEditTeacher("");
			setShowEditDepartmentModal(false);
		}
	};

	// Handler for deleting a class
	const handleDeleteClass = (classId) => {
		if (
			window.confirm(
				"Are you sure you want to delete this class and all its departments?"
			)
		) {
			setClasses(classes.filter((c) => c.id !== classId));
		}
	};

	// Handler for deleting a department
	const handleDeleteDepartment = (classId, departmentId) => {
		if (window.confirm("Are you sure you want to delete this department?")) {
			setClasses(
				classes.map((cls) => {
					if (cls.id === classId) {
						return {
							...cls,
							departments: cls.departments.filter((d) => d.id !== departmentId),
						};
					}
					return cls;
				})
			);
		}
	};

	// Handler for subject selection in create form
	const handleSubjectSelect = (subjectId) => {
		const isSelected = selectedSubjects.includes(subjectId);
		if (isSelected) {
			setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
		} else {
			setSelectedSubjects([...selectedSubjects, subjectId]);
		}
	};

	// Handler for subject selection in edit form
	const handleEditSubjectSelect = (subjectId) => {
		const isSelected = editSubjects.includes(subjectId);
		if (isSelected) {
			setEditSubjects(editSubjects.filter((id) => id !== subjectId));
		} else {
			setEditSubjects([...editSubjects, subjectId]);
		}
	};

	// Handler for opening department modal for a specific class
	const handleAddDepartment = (classObj) => {
		setSelectedClassForDept(classObj);
		setShowDepartmentModal(true);
	};

	// Handler for opening edit class modal
	const handleOpenEditClass = (classObj) => {
		setClassToEdit(classObj);
		setEditGrade(classObj.grade);
		setEditSubjects(classObj.subjects.map((subj) => subj.id));
		setShowEditClassModal(true);
	};

	// Handler for opening edit department modal
	const handleOpenEditDepartment = (classObj, departmentObj) => {
		setDepartmentParentClass(classObj);
		setDepartmentToEdit(departmentObj);
		setEditDepartmentName(departmentObj.name);
		setEditTeacher(departmentObj.teacherId.toString());
		setShowEditDepartmentModal(true);
	};

	return (
		<div className="cm-container">
			<div className="cm-header">
				<div className="cm-header-title">
					<h1>Class Management</h1>
					<p className="cm-subtitle">
						Manage your school classes and departments
					</p>
				</div>
				<button
					className="cm-btn cm-btn-primary"
					onClick={() => setShowClassModal(true)}
				>
					<FontAwesomeIcon icon={faPlus} className="cm-btn-icon-left" />
					Create New Class
				</button>
			</div>

			{classes.length === 0 ? (
				<div className="cm-empty-state">
					<div className="cm-empty-icon">
						<FontAwesomeIcon icon={faGraduationCap} />
					</div>
					<h2>No Classes Created</h2>
					<p>Add your first class to get started with class management</p>
					<button
						className="cm-btn cm-btn-primary"
						onClick={() => setShowClassModal(true)}
					>
						<FontAwesomeIcon icon={faPlus} className="cm-btn-icon-left" />
						Create Class
					</button>
				</div>
			) : (
				<div className="cm-class-list">
					{classes.map((cls) => (
						<div className="cm-class-container" key={cls.id}>
							<div className="cm-class-header">
								<div className="cm-class-info">
									<h2>
										<FontAwesomeIcon
											icon={faGraduationCap}
											className="cm-header-icon"
										/>
										Grade {cls.grade}
									</h2>
									<div className="cm-badge-container">
										{cls.subjects.slice(0, 3).map((subj) => (
											<span className="cm-badge" key={subj.id}>
												{subj.name}
											</span>
										))}
										{cls.subjects.length > 3 && (
											<span className="cm-badge cm-badge-more">
												+{cls.subjects.length - 3}
											</span>
										)}
									</div>
								</div>
								<div className="cm-class-actions">
									<button
										className="cm-btn cm-btn-secondary"
										onClick={() => handleAddDepartment(cls)}
									>
										<FontAwesomeIcon
											icon={faPlus}
											className="cm-btn-icon-left"
										/>
										Add Department
									</button>
									<button
										className="cm-btn cm-btn-icon cm-btn-edit"
										onClick={() => handleOpenEditClass(cls)}
										aria-label="Edit class"
									>
										<FontAwesomeIcon icon={faEdit} />
									</button>
									<button
										className="cm-btn cm-btn-icon cm-btn-danger-subtle"
										onClick={() => handleDeleteClass(cls.id)}
										aria-label="Delete class"
									>
										<FontAwesomeIcon icon={faTrashAlt} />
									</button>
								</div>
							</div>

							<div className="cm-dept-list">
								{cls.departments.length === 0 ? (
									<div className="cm-dept-empty">
										<FontAwesomeIcon
											icon={faChalkboardTeacher}
											className="cm-empty-dept-icon"
										/>
										<p>No departments created for this class</p>
										<button
											className="cm-btn cm-btn-outline"
											onClick={() => handleAddDepartment(cls)}
										>
											<FontAwesomeIcon
												icon={faPlus}
												className="cm-btn-icon-left"
											/>
											Add Department
										</button>
									</div>
								) : (
									cls.departments.map((dept) => (
										<div className="cm-dept-card" key={dept.id}>
											<div className="cm-dept-name">
												{cls.grade}
												{dept.name}
											</div>
											<div className="cm-dept-teacher">
												<FontAwesomeIcon
													icon={faUser}
													className="cm-dept-icon"
												/>
												<span>{dept.teacherName}</span>
											</div>
											<div className="cm-dept-actions">
												<button
													className="cm-btn cm-btn-icon cm-btn-edit"
													onClick={() => handleOpenEditDepartment(cls, dept)}
													aria-label="Edit department"
												>
													<FontAwesomeIcon icon={faEdit} />
												</button>
												<button
													className="cm-btn cm-btn-icon cm-btn-danger-subtle"
													onClick={() =>
														handleDeleteDepartment(cls.id, dept.id)
													}
													aria-label="Delete department"
												>
													<FontAwesomeIcon icon={faTrashAlt} />
												</button>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Class Creation Modal */}
			{showClassModal && (
				<div className="cm-modal-overlay">
					<div className="cm-modal">
						<div className="cm-modal-header">
							<h2>
								<FontAwesomeIcon
									icon={faGraduationCap}
									className="cm-modal-header-icon"
								/>
								Create New Class
							</h2>
							<button
								className="cm-btn cm-btn-icon"
								onClick={() => setShowClassModal(false)}
								aria-label="Close modal"
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
						<div className="cm-modal-body">
							<div className="cm-form-group">
								<label htmlFor="class-grade">Grade:</label>
								<select
									id="class-grade"
									className="cm-select"
									value={newGrade}
									onChange={(e) => setNewGrade(e.target.value)}
								>
									<option value="">Select Grade</option>
									{[...Array(12)].map((_, i) => (
										<option key={i + 1} value={i + 1}>
											{i + 1}
										</option>
									))}
								</select>
							</div>
							<div className="cm-form-group">
								<label>Subjects:</label>
								<div className="cm-subject-selector">
									{subjects.map((subject) => (
										<div className="cm-subject-option" key={subject.id}>
											<input
												type="checkbox"
												id={`subject-${subject.id}`}
												checked={selectedSubjects.includes(subject.id)}
												onChange={() => handleSubjectSelect(subject.id)}
											/>
											<label htmlFor={`subject-${subject.id}`}>
												{subject.name}
											</label>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="cm-modal-footer">
							<button
								className="cm-btn cm-btn-secondary"
								onClick={() => setShowClassModal(false)}
							>
								Cancel
							</button>
							<button
								className="cm-btn cm-btn-primary"
								onClick={handleCreateClass}
								disabled={!newGrade || selectedSubjects.length === 0}
							>
								<FontAwesomeIcon icon={faPlus} className="cm-btn-icon-left" />
								Create Class
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Class Edit Modal */}
			{showEditClassModal && (
				<div className="cm-modal-overlay">
					<div className="cm-modal">
						<div className="cm-modal-header">
							<h2>
								<FontAwesomeIcon
									icon={faEdit}
									className="cm-modal-header-icon"
								/>
								Edit Class
							</h2>
							<button
								className="cm-btn cm-btn-icon"
								onClick={() => setShowEditClassModal(false)}
								aria-label="Close modal"
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
						<div className="cm-modal-body">
							<div className="cm-form-group">
								<label htmlFor="edit-class-grade">Grade:</label>
								<select
									id="edit-class-grade"
									className="cm-select"
									value={editGrade}
									onChange={(e) => setEditGrade(e.target.value)}
								>
									<option value="">Select Grade</option>
									{[...Array(12)].map((_, i) => (
										<option key={i + 1} value={i + 1}>
											{i + 1}
										</option>
									))}
								</select>
							</div>
							<div className="cm-form-group">
								<label>Subjects:</label>
								<div className="cm-subject-selector">
									{subjects.map((subject) => (
										<div className="cm-subject-option" key={subject.id}>
											<input
												type="checkbox"
												id={`edit-subject-${subject.id}`}
												checked={editSubjects.includes(subject.id)}
												onChange={() => handleEditSubjectSelect(subject.id)}
											/>
											<label htmlFor={`edit-subject-${subject.id}`}>
												{subject.name}
											</label>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="cm-modal-footer">
							<button
								className="cm-btn cm-btn-secondary"
								onClick={() => setShowEditClassModal(false)}
							>
								Cancel
							</button>
							<button
								className="cm-btn cm-btn-primary"
								onClick={handleEditClass}
								disabled={!editGrade || editSubjects.length === 0}
							>
								<FontAwesomeIcon icon={faSave} className="cm-btn-icon-left" />
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Department Creation Modal */}
			{showDepartmentModal && (
				<div className="cm-modal-overlay">
					<div className="cm-modal">
						<div className="cm-modal-header">
							<h2>
								<FontAwesomeIcon
									icon={faChalkboardTeacher}
									className="cm-modal-header-icon"
								/>
								Add Department to Grade {selectedClassForDept?.grade}
							</h2>
							<button
								className="cm-btn cm-btn-icon"
								onClick={() => setShowDepartmentModal(false)}
								aria-label="Close modal"
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
						<div className="cm-modal-body">
							<div className="cm-form-group">
								<label htmlFor="department-name">Department Name:</label>
								<input
									id="department-name"
									type="text"
									className="cm-input"
									placeholder="e.g., A, B, C"
									value={newDepartmentName}
									onChange={(e) => setNewDepartmentName(e.target.value)}
								/>
							</div>
							<div className="cm-form-group">
								<label htmlFor="class-teacher">Class Teacher:</label>
								<select
									id="class-teacher"
									className="cm-select"
									value={selectedTeacher}
									onChange={(e) => setSelectedTeacher(e.target.value)}
								>
									<option value="">Select Class Teacher</option>
									{teachers.map((teacher) => (
										<option key={teacher.id} value={teacher.id}>
											{teacher.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="cm-modal-footer">
							<button
								className="cm-btn cm-btn-secondary"
								onClick={() => setShowDepartmentModal(false)}
							>
								Cancel
							</button>
							<button
								className="cm-btn cm-btn-primary"
								onClick={handleCreateDepartment}
								disabled={!newDepartmentName || !selectedTeacher}
							>
								<FontAwesomeIcon icon={faPlus} className="cm-btn-icon-left" />
								Add Department
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Department Edit Modal */}
			{showEditDepartmentModal && (
				<div className="cm-modal-overlay">
					<div className="cm-modal">
						<div className="cm-modal-header">
							<h2>
								<FontAwesomeIcon
									icon={faEdit}
									className="cm-modal-header-icon"
								/>
								Edit Department
							</h2>
							<button
								className="cm-btn cm-btn-icon"
								onClick={() => setShowEditDepartmentModal(false)}
								aria-label="Close modal"
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
						<div className="cm-modal-body">
							<div className="cm-form-group">
								<label htmlFor="edit-department-name">Department Name:</label>
								<input
									id="edit-department-name"
									type="text"
									className="cm-input"
									placeholder="e.g., A, B, C"
									value={editDepartmentName}
									onChange={(e) => setEditDepartmentName(e.target.value)}
								/>
							</div>
							<div className="cm-form-group">
								<label htmlFor="edit-class-teacher">Class Teacher:</label>
								<select
									id="edit-class-teacher"
									className="cm-select"
									value={editTeacher}
									onChange={(e) => setEditTeacher(e.target.value)}
								>
									<option value="">Select Class Teacher</option>
									{teachers.map((teacher) => (
										<option key={teacher.id} value={teacher.id}>
											{teacher.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="cm-modal-footer">
							<button
								className="cm-btn cm-btn-secondary"
								onClick={() => setShowEditDepartmentModal(false)}
							>
								Cancel
							</button>
							<button
								className="cm-btn cm-btn-primary"
								onClick={handleEditDepartment}
								disabled={!editDepartmentName || !editTeacher}
							>
								<FontAwesomeIcon icon={faSave} className="cm-btn-icon-left" />
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClassManagement;
