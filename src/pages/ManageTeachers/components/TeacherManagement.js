import React, { useState, useEffect } from "react";
import "./TeacherManagement.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboardTeacher, faPlus } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../../hooks/useAuth";
import teacherApi from "../../../api/teacherApi";
import subjectApi from "../../../api/subjectApi";
import departmentApi from "../../../api/departmentApi";
import TeacherTable from "./TeacherTable";
import TeacherModal from "./TeacherModal";
import ManageSubjectsModal from "./ManageSubjectsModal";

const TeacherManagement = () => {
	const { user } = useAuth();
	const token = user?.token;

	// ======================
	// State
	// ======================
	const [teachers, setTeachers] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	// Teacher Modal (Add/Edit)
	const [showTeacherModal, setShowTeacherModal] = useState(false);
	const [currentTeacher, setCurrentTeacher] = useState(null);
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
	const [subjectTeacher, setSubjectTeacher] = useState(null);
	const [subjectId, setSubjectId] = useState("");
	const [departmentSelection, setDepartmentSelection] = useState([]);

	// ======================
	// Fetch Data
	// ======================
	useEffect(() => {
		if (!token) return;
		(async () => {
			try {
				const teacherData = await teacherApi.getAllTeachers(token);
				setTeachers(teacherData);

				const subjectData = await subjectApi.getAllSubjects(token);
				setSubjects(subjectData);

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
				const updated = await teacherApi.updateTeacher(
					currentTeacher.id,
					teacherFormData,
					token
				);
				setTeachers((prev) =>
					prev.map((t) => (t.id === currentTeacher.id ? updated : t))
				);
			} else {
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

		// Check for duplicate assignment
		const existingAssignment = subjectTeacher.assignedSubjects.find(
			(as) =>
				as.subjectId === subjectId &&
				JSON.stringify(as.departmentId.sort()) ===
					JSON.stringify(departmentSelection.sort())
		);

		if (existingAssignment) {
			alert("This subject is already assigned to the selected departments.");
			return;
		}

		try {
			const assignedSubject = { subjectId, departmentId: departmentSelection };
			const updatedTeacher = await teacherApi.addSubjectToTeacher(
				subjectTeacher.id,
				assignedSubject,
				token
			);

			setTeachers((prev) =>
				prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
			);
			setSubjectTeacher(updatedTeacher);
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

			<TeacherTable
				teachers={teachers}
				searchTerm={searchTerm}
				onEditTeacher={openEditTeacherModal}
				onDeleteTeacher={deleteTeacher}
				onManageSubjects={openSubjectModal}
				// Pass helper functions to look up names
				getSubjectName={(subId) => {
					const sub = subjects.find((s) => s.id === subId);
					return sub ? sub.name : subId;
				}}
				getDepartmentNames={(depIds) => {
					const names = depIds.map((id) => {
						const found = departments.find((d) => d.id === id);
						return found ? found.departmentName : id;
					});
					return names.join(", ");
				}}
			/>

			{showTeacherModal && (
				<TeacherModal
					teacher={currentTeacher}
					formData={teacherFormData}
					onClose={closeTeacherModal}
					onSave={saveTeacher}
					onChange={handleTeacherFormChange}
				/>
			)}

			{showSubjectModal && subjectTeacher && (
				<ManageSubjectsModal
					teacher={subjectTeacher}
					subjects={subjects}
					departments={departments}
					subjectId={subjectId}
					onSubjectChange={(value) => setSubjectId(value)}
					departmentSelection={departmentSelection}
					onDepartmentCheck={handleDepartmentCheck}
					onAddSubject={handleAddSubjectToTeacher}
					onClose={closeSubjectModal}
					onRemoveSubject={handleRemoveSubjectFromTeacher}
				/>
			)}
		</div>
	);
};

export default TeacherManagement;
