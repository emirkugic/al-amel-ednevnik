import React, { useState, useEffect } from "react";
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
	faChevronDown,
	faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import classApi from "../../api/classApi";
import departmentApi from "../../api/departmentApi";
import subjectApi from "../../api/subjectApi";
import teacherApi from "../../api/teacherApi";
import useAuth from "../../hooks/useAuth";
import { useLanguage } from "../../contexts";
import "./ClassManagement.css";

const ClassManagement = () => {
	const { user } = useAuth();
	const { t } = useLanguage();

	// State for classes, teachers, and subjects
	const [classes, setClasses] = useState([]);
	const [teachers, setTeachers] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [departments, setDepartments] = useState([]);

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

	// Fetch initial data
	useEffect(() => {
		if (!user?.token) return;

		const fetchData = async () => {
			try {
				const [classData, departmentData, subjectData, teacherData] =
					await Promise.all([
						classApi.getAllClasses(user.token),
						departmentApi.getAllDepartments(user.token),
						subjectApi.getAllSubjects(user.token),
						teacherApi.getAllTeachers(user.token),
					]);

				// Transform backend data to match the UI structure
				const transformedClasses = classData.map((cls) => ({
					id: cls.id,
					grade: cls.gradeLevel,
					subjects: cls.subjects.map((subId) => {
						const subject = subjectData.find((s) => s.id === subId);
						return {
							id: subId,
							name: subject ? subject.name : "Unknown Subject",
						};
					}),
					departments: [],
				}));

				// Group departments by classId
				departmentData.forEach((dept) => {
					const classIndex = transformedClasses.findIndex(
						(cls) => cls.id === dept.classId
					);
					if (classIndex !== -1) {
						const teacherObj = teacherData.find(
							(t) => t.id === dept.classTeacherId
						);
						transformedClasses[classIndex].departments.push({
							id: dept.id,
							name: dept.departmentName,
							teacherId: dept.classTeacherId || "",
							teacherName: teacherObj
								? `${teacherObj.firstName} ${teacherObj.lastName}`
								: "",
						});
					}
				});

				setClasses(transformedClasses);
				setDepartments(departmentData);
				setSubjects(subjectData);
				setTeachers(teacherData);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, [user]);

	// Handler for creating a new class
	const handleCreateClass = async () => {
		if (newGrade && selectedSubjects.length > 0) {
			const classData = {
				gradeLevel: newGrade,
				subjects: selectedSubjects,
			};

			try {
				const newClass = await classApi.createClass(classData, user.token);

				// Transform for UI
				const transformedClass = {
					id: newClass.id,
					grade: newClass.gradeLevel,
					subjects: selectedSubjects.map((id) => {
						const subject = subjects.find((s) => s.id === id);
						return { id, name: subject ? subject.name : "Unknown Subject" };
					}),
					departments: [],
				};

				setClasses([...classes, transformedClass]);
				setNewGrade("");
				setSelectedSubjects([]);
				setShowClassModal(false);
			} catch (error) {
				console.error("Error creating class:", error);
			}
		}
	};

	// Handler for editing a class
	const handleEditClass = async () => {
		if (classToEdit && editGrade && editSubjects.length > 0) {
			const classData = {
				id: classToEdit.id,
				gradeLevel: editGrade,
				subjects: editSubjects,
			};

			try {
				await classApi.updateClass(classToEdit.id, classData, user.token);

				setClasses(
					classes.map((cls) => {
						if (cls.id === classToEdit.id) {
							return {
								...cls,
								grade: editGrade,
								subjects: editSubjects.map((id) => {
									const subject = subjects.find((s) => s.id === id);
									return {
										id,
										name: subject ? subject.name : "Unknown Subject",
									};
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
			} catch (error) {
				console.error("Error updating class:", error);
			}
		}
	};

	// Handler for creating a new department
	const handleCreateDepartment = async () => {
		if (selectedClassForDept && newDepartmentName) {
			const departmentData = {
				classId: selectedClassForDept.id,
				departmentName: newDepartmentName,
				classTeacherId: selectedTeacher || null,
			};

			try {
				const newDepartment = await departmentApi.createDepartment(
					departmentData,
					user.token
				);

				const teacherObj = teachers.find(
					(t) => t.id === (selectedTeacher || "")
				);
				const uiDepartment = {
					id: newDepartment.id,
					name: newDepartment.departmentName,
					teacherId: newDepartment.classTeacherId || "",
					teacherName: teacherObj
						? `${teacherObj.firstName} ${teacherObj.lastName}`
						: "",
				};

				setClasses(
					classes.map((cls) => {
						if (cls.id === selectedClassForDept.id) {
							return {
								...cls,
								departments: [...cls.departments, uiDepartment],
							};
						}
						return cls;
					})
				);

				// Update departments list
				setDepartments([...departments, newDepartment]);

				setNewDepartmentName("");
				setSelectedTeacher("");
				setShowDepartmentModal(false);
			} catch (error) {
				console.error("Error creating department:", error);
			}
		}
	};

	// Handler for editing a department
	const handleEditDepartment = async () => {
		if (departmentToEdit && departmentParentClass && editDepartmentName) {
			const departmentData = {
				id: departmentToEdit.id,
				classId: departmentParentClass.id,
				departmentName: editDepartmentName,
				classTeacherId: editTeacher || null,
			};

			try {
				await departmentApi.updateDepartment(
					departmentToEdit.id,
					departmentData,
					user.token
				);

				const teacherObj = teachers.find((t) => t.id === (editTeacher || ""));

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
											teacherId: editTeacher || "",
											teacherName: teacherObj
												? `${teacherObj.firstName} ${teacherObj.lastName}`
												: "",
										};
									}
									return dept;
								}),
							};
						}
						return cls;
					})
				);

				// Update departments list
				setDepartments(
					departments.map((dept) =>
						dept.id === departmentToEdit.id ? departmentData : dept
					)
				);

				setDepartmentToEdit(null);
				setDepartmentParentClass(null);
				setEditDepartmentName("");
				setEditTeacher("");
				setShowEditDepartmentModal(false);
			} catch (error) {
				console.error("Error updating department:", error);
			}
		}
	};

	// Handler for deleting a class
	const handleDeleteClass = async (classId) => {
		if (window.confirm(t("classes.deleteClassConfirm"))) {
			try {
				await classApi.deleteClass(classId, user.token);
				setClasses(classes.filter((c) => c.id !== classId));
			} catch (error) {
				console.error("Error deleting class:", error);
			}
		}
	};

	// Handler for deleting a department
	const handleDeleteDepartment = async (classId, departmentId) => {
		if (window.confirm(t("classes.deleteDepartmentConfirm"))) {
			try {
				await departmentApi.deleteDepartment(departmentId, user.token);

				setClasses(
					classes.map((cls) => {
						if (cls.id === classId) {
							return {
								...cls,
								departments: cls.departments.filter(
									(d) => d.id !== departmentId
								),
							};
						}
						return cls;
					})
				);

				// Update departments list
				setDepartments(departments.filter((d) => d.id !== departmentId));
			} catch (error) {
				console.error("Error deleting department:", error);
			}
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
		setEditTeacher(
			departmentObj.teacherId ? departmentObj.teacherId.toString() : ""
		);
		setShowEditDepartmentModal(true);
	};

	return (
		<div className="cm-container">
			<div className="cm-header">
				<div className="cm-header-title">
					<h1>{t("classes.pageTitle")}</h1>
					<p className="cm-subtitle">{t("classes.subtitle")}</p>
				</div>
				<button
					className="cm-btn cm-btn-primary"
					onClick={() => setShowClassModal(true)}
				>
					<FontAwesomeIcon icon={faPlus} className="cm-btn-icon-left" />
					{t("classes.createNewClass")}
				</button>
			</div>

			{classes.length === 0 ? (
				<div className="cm-empty-state">
					<div className="cm-empty-icon">
						<FontAwesomeIcon icon={faGraduationCap} />
					</div>
					<h2>{t("classes.noClassesTitle")}</h2>
					<p>{t("classes.noClassesDesc")}</p>
					<button
						className="cm-btn cm-btn-primary"
						onClick={() => setShowClassModal(true)}
					>
						<FontAwesomeIcon icon={faPlus} className="cm-btn-icon-left" />
						{t("classes.createClass")}
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
										{t("classes.grade")} {cls.grade}
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
										{t("classes.addDepartment")}
									</button>
									<button
										className="cm-btn cm-btn-icon cm-btn-edit"
										onClick={() => handleOpenEditClass(cls)}
										aria-label={t("classes.editClass")}
									>
										<FontAwesomeIcon icon={faEdit} />
									</button>
									<button
										className="cm-btn cm-btn-icon cm-btn-danger-subtle"
										onClick={() => handleDeleteClass(cls.id)}
										aria-label={t("classes.deleteClass")}
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
										<p>{t("classes.noDepartments")}</p>
										<button
											className="cm-btn cm-btn-outline"
											onClick={() => handleAddDepartment(cls)}
										>
											<FontAwesomeIcon
												icon={faPlus}
												className="cm-btn-icon-left"
											/>
											{t("classes.addDepartment")}
										</button>
									</div>
								) : (
									cls.departments.map((dept) => (
										<div className="cm-dept-card" key={dept.id}>
											<div className="cm-dept-name">{dept.name}</div>
											<div className="cm-dept-teacher">
												<FontAwesomeIcon
													icon={faUser}
													className="cm-dept-icon"
												/>
												<span>
													{dept.teacherName || t("classes.noTeacherAssigned")}
												</span>
											</div>
											<div className="cm-dept-actions">
												<button
													className="cm-btn cm-btn-icon cm-btn-edit"
													onClick={() => handleOpenEditDepartment(cls, dept)}
													aria-label={t("classes.editDepartment")}
												>
													<FontAwesomeIcon icon={faEdit} />
												</button>
												<button
													className="cm-btn cm-btn-icon cm-btn-danger-subtle"
													onClick={() =>
														handleDeleteDepartment(cls.id, dept.id)
													}
													aria-label={t("common.delete")}
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
								{t("classes.createNewClass")}
							</h2>
							<button
								className="cm-btn cm-btn-icon"
								onClick={() => setShowClassModal(false)}
								aria-label={t("common.cancel")}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
						<div className="cm-modal-body">
							<div className="cm-form-group">
								<label htmlFor="class-grade">{t("classes.gradeLabel")}</label>
								<select
									id="class-grade"
									className="cm-select"
									value={newGrade}
									onChange={(e) => setNewGrade(e.target.value)}
								>
									<option value="">{t("classes.selectGrade")}</option>
									{[...Array(12)].map((_, i) => (
										<option key={i + 1} value={i + 1}>
											{i + 1}
										</option>
									))}
								</select>
							</div>
							<div className="cm-form-group">
								<label>{t("classes.subjects")}</label>
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
								{t("classes.cancel")}
							</button>
							<button
								className="cm-btn cm-btn-primary"
								onClick={handleCreateClass}
								disabled={!newGrade || selectedSubjects.length === 0}
							>
								<FontAwesomeIcon icon={faPlus} className="cm-btn-icon-left" />
								{t("classes.createClass")}
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
								{t("classes.editClass")}
							</h2>
							<button
								className="cm-btn cm-btn-icon"
								onClick={() => setShowEditClassModal(false)}
								aria-label={t("common.cancel")}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
						<div className="cm-modal-body">
							<div className="cm-form-group">
								<label htmlFor="edit-class-grade">
									{t("classes.gradeLabel")}
								</label>
								<select
									id="edit-class-grade"
									className="cm-select"
									value={editGrade}
									onChange={(e) => setEditGrade(e.target.value)}
								>
									<option value="">{t("classes.selectGrade")}</option>
									{[...Array(12)].map((_, i) => (
										<option key={i + 1} value={i + 1}>
											{i + 1}
										</option>
									))}
								</select>
							</div>
							<div className="cm-form-group">
								<label>{t("classes.subjects")}</label>
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
								{t("classes.cancel")}
							</button>
							<button
								className="cm-btn cm-btn-primary"
								onClick={handleEditClass}
								disabled={!editGrade || editSubjects.length === 0}
							>
								<FontAwesomeIcon icon={faSave} className="cm-btn-icon-left" />
								{t("classes.saveChanges")}
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
								{t("classes.addDepartment")} {t("classes.grade")}{" "}
								{selectedClassForDept?.grade}
							</h2>
							<button
								className="cm-btn cm-btn-icon"
								onClick={() => setShowDepartmentModal(false)}
								aria-label={t("common.cancel")}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
						<div className="cm-modal-body">
							<div className="cm-form-group">
								<label htmlFor="department-name">
									{t("classes.departmentName")}
								</label>
								<input
									id="department-name"
									type="text"
									className="cm-input"
									placeholder={t("classes.departmentPlaceholder")}
									value={newDepartmentName}
									onChange={(e) => setNewDepartmentName(e.target.value)}
								/>
							</div>
							<div className="cm-form-group">
								<label htmlFor="class-teacher">
									{t("classes.classTeacher")}
								</label>
								<select
									id="class-teacher"
									className="cm-select"
									value={selectedTeacher}
									onChange={(e) => setSelectedTeacher(e.target.value)}
								>
									<option value="">{t("classes.selectTeacher")}</option>
									{teachers.map((teacher) => (
										<option key={teacher.id} value={teacher.id}>
											{teacher.firstName} {teacher.lastName}
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
								{t("classes.cancel")}
							</button>
							<button
								className="cm-btn cm-btn-primary"
								onClick={handleCreateDepartment}
								disabled={!newDepartmentName}
							>
								<FontAwesomeIcon icon={faPlus} className="cm-btn-icon-left" />
								{t("classes.addDepartment")}
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
								{t("classes.editDepartment")}
							</h2>
							<button
								className="cm-btn cm-btn-icon"
								onClick={() => setShowEditDepartmentModal(false)}
								aria-label={t("common.cancel")}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
						<div className="cm-modal-body">
							<div className="cm-form-group">
								<label htmlFor="edit-department-name">
									{t("classes.departmentName")}
								</label>
								<input
									id="edit-department-name"
									type="text"
									className="cm-input"
									placeholder={t("classes.departmentPlaceholder")}
									value={editDepartmentName}
									onChange={(e) => setEditDepartmentName(e.target.value)}
								/>
							</div>
							<div className="cm-form-group">
								<label htmlFor="edit-class-teacher">
									{t("classes.classTeacher")}
								</label>
								<select
									id="edit-class-teacher"
									className="cm-select"
									value={editTeacher}
									onChange={(e) => setEditTeacher(e.target.value)}
								>
									<option value="">{t("classes.selectTeacher")}</option>
									{teachers.map((teacher) => (
										<option key={teacher.id} value={teacher.id}>
											{teacher.firstName} {teacher.lastName}
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
								{t("classes.cancel")}
							</button>
							<button
								className="cm-btn cm-btn-primary"
								onClick={handleEditDepartment}
								disabled={!editDepartmentName}
							>
								<FontAwesomeIcon icon={faSave} className="cm-btn-icon-left" />
								{t("classes.saveChanges")}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClassManagement;
