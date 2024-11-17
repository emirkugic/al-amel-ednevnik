import React, { useState, useEffect } from "react";
import { faEdit, faTrashAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TeacherModal from "../TeacherModal/TeacherModal";
import "./TeacherManagement.css";
import teacherApi from "../../api/teacherApi";
import subjectApi from "../../api/subjectApi";
import useAuth from "../../hooks/useAuth";

const TeacherManagement = () => {
	const { user } = useAuth();
	const [teachers, setTeachers] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTeacher, setSelectedTeacher] = useState(null);

	useEffect(() => {
		if (!user || !user.token) return;

		const fetchData = async () => {
			try {
				const [teacherData, subjectData] = await Promise.all([
					teacherApi.getAllTeachers(user.token),
					subjectApi.getAllSubjects(user.token),
				]);
				setTeachers(teacherData);
				setSubjects(subjectData);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};
		fetchData();
	}, [user]);

	const handleOpenModal = (teacher = null) => {
		setSelectedTeacher(teacher);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedTeacher(null);
	};

	const handleSaveTeacher = async (teacherData) => {
		try {
			const subjectAssignments = teacherData.subjects.map((subject) => ({
				subjectId: subject.subjectId,
				gradeLevels: subject.grades.map((grade) => parseInt(grade, 10)),
			}));

			const newTeacher = {
				firstName: teacherData.name,
				lastName: teacherData.surname,
				email: teacherData.email,
				loginPassword: teacherData.loginPassword,
				gradePassword: teacherData.gradePassword,
				subjectAssignments,
				timetable: [],
			};

			if (selectedTeacher) {
				// Update existing teacher logic if needed
				console.log("Updating teacher (not implemented yet)");
			} else {
				await teacherApi.createTeacher(newTeacher, user.token);
				const updatedTeachers = await teacherApi.getAllTeachers(user.token);
				setTeachers(updatedTeachers);
			}

			handleCloseModal();
		} catch (error) {
			console.error("Error saving teacher:", error);
		}
	};

	const handleDelete = async (teacherId) => {
		if (window.confirm("Are you sure you want to delete this teacher?")) {
			try {
				await teacherApi.deleteTeacher(teacherId, user.token);
				setTeachers((prevTeachers) =>
					prevTeachers.filter((teacher) => teacher.id !== teacherId)
				);
			} catch (error) {
				console.error("Error deleting teacher:", error);
			}
		}
	};

	if (!user || !user.token) {
		return <div>Loading...</div>;
	}

	return (
		<div className="teacher-management">
			<div className="header">
				<h2>Teacher Management</h2>
				<button className="add-teacher" onClick={() => handleOpenModal()}>
					<FontAwesomeIcon icon={faPlus} /> Add Teacher
				</button>
			</div>
			<div className="teacher-list">
				{teachers.map((teacher) => (
					<div className="teacher-card" key={teacher.id}>
						<div className="teacher-info">
							<h3>{`${teacher.firstName} ${teacher.lastName}`}</h3>
							<p>{teacher.email}</p>
						</div>
						<div className="teacher-actions">
							<button
								className="edit-button"
								onClick={() => handleOpenModal(teacher)}
							>
								<FontAwesomeIcon icon={faEdit} />
							</button>
							<button
								className="delete-button"
								onClick={() => handleDelete(teacher.id)}
							>
								<FontAwesomeIcon icon={faTrashAlt} />
							</button>
						</div>
					</div>
				))}
			</div>

			{isModalOpen && (
				<TeacherModal
					teacher={selectedTeacher}
					onClose={handleCloseModal}
					onSave={handleSaveTeacher}
					subjects={subjects}
				/>
			)}
		</div>
	);
};

export default TeacherManagement;
