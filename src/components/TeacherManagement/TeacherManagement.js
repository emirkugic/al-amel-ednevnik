// src/components/TeacherManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { faEdit, faTrashAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./TeacherManagement.css";

const TeacherManagement = () => {
	const [teachers, setTeachers] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTeacher, setSelectedTeacher] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
	});

	// Fetch all teachers from the API
	useEffect(() => {
		fetchTeachers();
	}, []);

	const fetchTeachers = async () => {
		try {
			const response = await axios.get("/api/teachers"); // Adjust the URL as needed
			setTeachers(response.data);
		} catch (error) {
			console.error("Failed to fetch teachers", error);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleOpenModal = (teacher = null) => {
		setSelectedTeacher(teacher);
		setFormData(
			teacher ? { ...teacher } : { name: "", email: "", subject: "" }
		);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedTeacher(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (selectedTeacher) {
				// Update teacher
				await axios.put(`/api/teachers/${selectedTeacher.id}`, formData);
			} else {
				// Create new teacher
				await axios.post("/api/teachers", formData);
			}
			fetchTeachers();
			handleCloseModal();
		} catch (error) {
			console.error("Failed to save teacher", error);
		}
	};

	const handleDelete = async (teacherId) => {
		if (window.confirm("Are you sure you want to delete this teacher?")) {
			try {
				await axios.delete(`/api/teachers/${teacherId}`);
				fetchTeachers();
			} catch (error) {
				console.error("Failed to delete teacher", error);
			}
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
						<th>Subject</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{teachers.map((teacher) => (
						<tr key={teacher.id}>
							<td>{teacher.name}</td>
							<td>{teacher.email}</td>
							<td>{teacher.subject}</td>
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

			{/* Modal for Create/Edit */}
			{isModalOpen && (
				<div className="modal-overlay">
					<div className="modal-content">
						<h3>{selectedTeacher ? "Edit Teacher" : "Add Teacher"}</h3>
						<form onSubmit={handleSubmit}>
							<label>
								Name:
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									required
								/>
							</label>
							<label>
								Email:
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									required
								/>
							</label>
							<label>
								Subject:
								<input
									type="text"
									name="subject"
									value={formData.subject}
									onChange={handleInputChange}
									required
								/>
							</label>
							<div className="modal-buttons">
								<button type="submit" className="save-button">
									Save
								</button>
								<button
									type="button"
									className="cancel-button"
									onClick={handleCloseModal}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default TeacherManagement;
