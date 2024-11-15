import React, { useState } from "react";
import { faEdit, faTrashAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TeacherModal from "../TeacherModal/TeacherModal";
import TeacherDetailsModal from "../TeacherDetailsModal/TeacherDetailsModal";
import "./TeacherManagement.css";

const TeacherManagement = () => {
	const [teachers, setTeachers] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [selectedTeacher, setSelectedTeacher] = useState(null);

	const handleOpenModal = (teacher = null) => {
		setSelectedTeacher(teacher);
		setIsModalOpen(true);
	};

	const handleOpenDetailsModal = (teacher) => {
		setSelectedTeacher(teacher);
		setIsDetailsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedTeacher(null);
	};

	const handleCloseDetailsModal = () => {
		setIsDetailsModalOpen(false);
		setSelectedTeacher(null);
	};

	const handleSaveTeacher = (teacherData) => {
		if (selectedTeacher) {
			setTeachers((prevTeachers) =>
				prevTeachers.map((teacher) =>
					teacher.id === selectedTeacher.id
						? { ...teacherData, id: teacher.id }
						: teacher
				)
			);
		} else {
			const newTeacher = { ...teacherData, id: Date.now() };
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
			<div className="teacher-list">
				{teachers.map((teacher) => (
					<div className="teacher-card" key={teacher.id}>
						<div className="teacher-info">
							<h3>{`${teacher.name} ${teacher.surname}`}</h3>
							<p>{teacher.email}</p>
						</div>
						<div className="teacher-actions">
							<button
								className="details-button"
								onClick={() => handleOpenDetailsModal(teacher)}
							>
								View Details
							</button>
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
				/>
			)}
			{isDetailsModalOpen && (
				<TeacherDetailsModal
					teacher={selectedTeacher}
					onClose={handleCloseDetailsModal}
				/>
			)}
		</div>
	);
};

export default TeacherManagement;
