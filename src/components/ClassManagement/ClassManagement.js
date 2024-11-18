import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTrash,
	faPlus,
	faChevronDown,
	faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import classApi from "../../api/classApi";
import departmentApi from "../../api/departmentApi";
import subjectApi from "../../api/subjectApi";
import teacherApi from "../../api/teacherApi";
import useAuth from "../../hooks/useAuth";
import "./ClassManagement.css";

const ClassManagement = () => {
	const { user } = useAuth();
	const [classes, setClasses] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [teachers, setTeachers] = useState([]);
	const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
	const [classInput, setClassInput] = useState({
		gradeLevel: "",
		subjects: [],
	});
	const [expandedClass, setExpandedClass] = useState(null);
	const [newDepartmentName, setNewDepartmentName] = useState("");
	const [selectedClassTeacher, setSelectedClassTeacher] = useState("");

	useEffect(() => {
		if (!user?.token) return;

		const fetchClasses = async () => {
			try {
				const classData = await classApi.getAllClasses(user.token);
				setClasses(classData);
			} catch (error) {
				console.error("Error fetching classes:", error);
			}
		};

		const fetchSubjects = async () => {
			try {
				const subjectData = await subjectApi.getAllSubjects(user.token);
				setSubjects(subjectData);
			} catch (error) {
				console.error("Error fetching subjects:", error);
			}
		};

		const fetchTeachers = async () => {
			try {
				const teacherData = await teacherApi.getAllTeachers(user.token);
				setTeachers(teacherData);
			} catch (error) {
				console.error("Error fetching teachers:", error);
			}
		};

		fetchClasses();
		fetchSubjects();
		fetchTeachers();
	}, [user]);

	const handleCreateClass = async () => {
		if (!classInput.gradeLevel || classInput.subjects.length === 0) {
			alert("Grade level and subjects are required!");
			return;
		}

		try {
			const newClass = await classApi.createClass(classInput, user.token);
			setClasses((prev) => [...prev, newClass]);
			setClassInput({ gradeLevel: "", subjects: [] });
			setIsClassDropdownOpen(false);
		} catch (error) {
			console.error("Error creating class:", error);
		}
	};

	const handleDeleteClass = async (id) => {
		if (window.confirm("Are you sure you want to delete this class?")) {
			try {
				await classApi.deleteClass(id, user.token);
				setClasses((prev) => prev.filter((c) => c.id !== id));
			} catch (error) {
				console.error("Error deleting class:", error);
			}
		}
	};

	const handleCreateDepartment = async (classId) => {
		if (!newDepartmentName || !selectedClassTeacher) {
			alert("Department name and class teacher are required!");
			return;
		}

		const departmentData = {
			classId,
			departmentName: newDepartmentName,
			classTeacherId: selectedClassTeacher,
		};

		try {
			const newDepartment = await departmentApi.createDepartment(
				departmentData,
				user.token
			);
			setClasses((prev) =>
				prev.map((cls) =>
					cls.id === classId
						? {
								...cls,
								departments: [...(cls.departments || []), newDepartment],
						  }
						: cls
				)
			);
			setNewDepartmentName("");
			setSelectedClassTeacher("");
		} catch (error) {
			console.error("Error creating department:", error);
		}
	};

	const handleDeleteDepartment = async (classId, departmentId) => {
		if (window.confirm("Are you sure you want to delete this department?")) {
			try {
				await departmentApi.deleteDepartment(departmentId, user.token);
				setClasses((prev) =>
					prev.map((cls) =>
						cls.id === classId
							? {
									...cls,
									departments: cls.departments.filter(
										(d) => d.id !== departmentId
									),
							  }
							: cls
					)
				);
			} catch (error) {
				console.error("Error deleting department:", error);
			}
		}
	};

	const toggleClassExpansion = (id) => {
		setExpandedClass((prev) => (prev === id ? null : id));
	};

	return (
		<div className="class-management">
			<h2>Class Management</h2>
			<div className="form-row">
				<label>
					Grade Level:
					<input
						type="text"
						value={classInput.gradeLevel}
						onChange={(e) =>
							setClassInput({ ...classInput, gradeLevel: e.target.value })
						}
					/>
				</label>
				<div className="dropdown-container">
					<div
						className="dropdown-header"
						onClick={() => setIsClassDropdownOpen((prev) => !prev)}
					>
						{classInput.subjects.length > 0
							? `${classInput.subjects.length} Subjects Selected`
							: "Select Subjects"}
					</div>
					{isClassDropdownOpen && (
						<div className="dropdown-menu">
							{subjects.map((subject) => (
								<label key={subject.id} className="dropdown-item">
									<input
										type="checkbox"
										checked={classInput.subjects.includes(subject.id)}
										onChange={() =>
											setClassInput((prev) => ({
												...prev,
												subjects: prev.subjects.includes(subject.id)
													? prev.subjects.filter((s) => s !== subject.id)
													: [...prev.subjects, subject.id],
											}))
										}
									/>
									{subject.name}
								</label>
							))}
						</div>
					)}
				</div>
				<button className="create-class-button" onClick={handleCreateClass}>
					Create Class
				</button>
			</div>
			<div className="class-list">
				{classes.map((cls) => (
					<div key={cls.id} className="class-card">
						<div
							className="class-card-header"
							onClick={() => toggleClassExpansion(cls.id)}
						>
							<h4>
								Grade: {cls.gradeLevel} ({cls.subjects.length} Subjects)
							</h4>
							<FontAwesomeIcon
								icon={expandedClass === cls.id ? faChevronUp : faChevronDown}
								className="expand-icon"
							/>
						</div>
						{expandedClass === cls.id && (
							<div className="class-departments">
								<h5>Departments</h5>
								<ul>
									{cls.departments?.map((dept) => (
										<li key={dept.id}>
											{dept.departmentName}
											<button
												className="delete-button"
												onClick={() => handleDeleteDepartment(cls.id, dept.id)}
											>
												<FontAwesomeIcon icon={faTrash} />
											</button>
										</li>
									))}
								</ul>
								<div className="form-row">
									<input
										type="text"
										placeholder="New Department Name"
										value={newDepartmentName}
										onChange={(e) => setNewDepartmentName(e.target.value)}
									/>
									<select
										value={selectedClassTeacher}
										onChange={(e) => setSelectedClassTeacher(e.target.value)}
									>
										<option value="">Select Class Teacher</option>
										{teachers.map((teacher) => (
											<option key={teacher.id} value={teacher.id}>
												{teacher.firstName} {teacher.lastName}
											</option>
										))}
									</select>
									<button
										className="create-department-button"
										onClick={() => handleCreateDepartment(cls.id)}
									>
										Add Department
									</button>
								</div>
							</div>
						)}
						<button
							className="delete-class-button"
							onClick={() => handleDeleteClass(cls.id)}
						>
							<FontAwesomeIcon icon={faTrash} /> Delete Class
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default ClassManagement;
