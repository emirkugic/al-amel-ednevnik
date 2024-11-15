// src/components/TeacherManagement.js
import React, { useState, useEffect } from "react";
import { faEdit, faTrashAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TeacherModal from "../TeacherModal/TeacherModal";
import "./TeacherManagement.css";

const TeacherManagement = () => {
	const [teachers, setTeachers] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTeacher, setSelectedTeacher] = useState(null);

	const handleOpenModal = (teacher = null) => {
		setSelectedTeacher(teacher);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedTeacher(null);
	};

	const handleSaveTeacher = (teacherData) => {
		if (selectedTeacher) {
			// Update existing teacher
			setTeachers((prevTeachers) =>
				prevTeachers.map((teacher) =>
					teacher.id === selectedTeacher.id
						? { ...teacherData, id: teacher.id }
						: teacher
				)
			);
		} else {
			// Add new teacher to the list
			const newTeacher = { ...teacherData, id: Date.now() }; // Generate a temporary unique ID
			setTeachers((prevTeachers) => [...prevTeachers, newTeacher]);
		}
		handleCloseModal();
	};

	const handleDelete = (teacherId) => {
		if (window.confirm("Are you sure you want to delete this teacher?")) {
			setTeachers((prevTeachers) =>
				prevTeachers.filter((teacher) => teacher.id !== teacherId)
			);
		}
	};

	return (
		<div className="teacher-management">
			<div className="header">
				<h2>Teacher Management</h2>
				<button className="add-button" onClick={() => handleOpenModal()}>
					<FontAwesomeIcon icon={faPlus} /> Add Teacher
				</button>
			</div>
			<table className="teacher-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Subjects</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{teachers.map((teacher) => (
						<tr key={teacher.id}>
							<td>{`${teacher.name} ${teacher.surname}`}</td>
							<td>{teacher.email}</td>
							<td>
								{teacher.subjects.map((subject, index) => (
									<div key={index}>{`${subject.subject} (${subject.grades.join(
										", "
									)})`}</div>
								))}
							</td>
							<td>
								<button onClick={() => handleOpenModal(teacher)}>
									<FontAwesomeIcon icon={faEdit} />
								</button>
								<button onClick={() => handleDelete(teacher.id)}>
									<FontAwesomeIcon icon={faTrashAlt} />
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{isModalOpen && (
				<TeacherModal
					teacher={selectedTeacher}
					onClose={handleCloseModal}
					onSave={handleSaveTeacher}
				/>
			)}
		</div>
	);
};

export default TeacherManagement;
