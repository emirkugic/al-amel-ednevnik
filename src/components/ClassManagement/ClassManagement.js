// Components/ClassManagement.js
import React, { useState, useEffect } from "react";
import classApi from "../../api/classApi";
import departmentApi from "../../api/departmentApi";
import subjectApi from "../../api/subjectApi";
import teacherApi from "../../api/teacherApi";
import useAuth from "../../hooks/useAuth";
import ClassesList from "./ClassesList";
import CreateClassForm from "./CreateClassForm";
import "./ClassManagement.css";

const ClassManagement = () => {
	const { user } = useAuth();
	const [classes, setClasses] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [teachers, setTeachers] = useState([]);
	const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
	const [classInput, setClassInput] = useState({
		gradeLevel: "",
		subjects: [],
	});
	const [expandedClass, setExpandedClass] = useState(null);

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
				setClasses(classData);
				setDepartments(departmentData);
				setSubjects(subjectData);
				setTeachers(teacherData);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
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

	const handleUpdateDepartmentTeacher = async (departmentId, newTeacherId) => {
		const department = departments.find((d) => d.id === departmentId);
		if (!department) {
			alert("Department not found");
			return;
		}

		const updatedDepartment = {
			...department,
			classTeacherId: newTeacherId || null,
		};

		try {
			await departmentApi.updateDepartment(
				departmentId,
				updatedDepartment,
				user.token
			);
			setDepartments((prev) =>
				prev.map((d) => (d.id === departmentId ? updatedDepartment : d))
			);
		} catch (error) {
			console.error("Error updating department:", error);
		}
	};

	const handleDeleteDepartment = async (departmentId) => {
		if (window.confirm("Are you sure you want to delete this department?")) {
			try {
				await departmentApi.deleteDepartment(departmentId, user.token);
				setDepartments((prev) => prev.filter((d) => d.id !== departmentId));
			} catch (error) {
				console.error("Error deleting department:", error);
			}
		}
	};

	const handleCreateDepartment = async (
		classId,
		departmentName,
		classTeacherId
	) => {
		const departmentData = {
			classId,
			departmentName,
			classTeacherId: classTeacherId || null,
		};

		try {
			const newDepartment = await departmentApi.createDepartment(
				departmentData,
				user.token
			);
			setDepartments((prev) => [...prev, newDepartment]);
		} catch (error) {
			console.error("Error creating department:", error);
		}
	};

	const toggleClassExpansion = (id) => {
		setExpandedClass((prev) => (prev === id ? null : id));
	};

	return (
		<div className="class-management">
			<h2>Class Management</h2>
			<CreateClassForm
				classInput={classInput}
				setClassInput={setClassInput}
				subjects={subjects}
				isClassDropdownOpen={isClassDropdownOpen}
				setIsClassDropdownOpen={setIsClassDropdownOpen}
				handleCreateClass={handleCreateClass}
			/>
			<ClassesList
				classes={classes}
				departments={departments}
				teachers={teachers}
				expandedClass={expandedClass}
				toggleClassExpansion={toggleClassExpansion}
				handleDeleteClass={handleDeleteClass}
				handleUpdateDepartmentTeacher={handleUpdateDepartmentTeacher}
				handleDeleteDepartment={handleDeleteDepartment}
				handleCreateDepartment={handleCreateDepartment}
			/>
		</div>
	);
};

export default ClassManagement;
