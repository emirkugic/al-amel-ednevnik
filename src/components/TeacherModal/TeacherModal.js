import React, { useState, useEffect } from "react";
import SubjectsAndDepartments from "./SubjectsAndDepartments";
import "./TeacherModal.css";

const TeacherModal = ({ teacher, onClose, onSave, subjects, departments }) => {
	const [formData, setFormData] = useState({
		name: "",
		surname: "",
		email: "",
		loginPassword: "",
		gradePassword: "",
		subjects: [],
	});

	useEffect(() => {
		if (teacher) {
			setFormData(teacher);
		}
	}, [teacher]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const updateSubjects = (subjects) => {
		setFormData({ ...formData, subjects });
	};

	const handleSave = () => {
		onSave(formData);
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<h3>{teacher ? "Edit Teacher" : "Add Teacher"}</h3>
				<form onSubmit={(e) => e.preventDefault()}>
					<div className="form-row">
						<label className="input-label">
							First Name
							<input
								type="text"
								name="name"
								placeholder="First name"
								value={formData.name}
								onChange={handleInputChange}
								required
							/>
						</label>
						<label className="input-label">
							Surname
							<input
								type="text"
								name="surname"
								placeholder="Surname"
								value={formData.surname}
								onChange={handleInputChange}
								required
							/>
						</label>
					</div>
					<div className="form-row">
						<label className="input-label">
							Email
							<input
								type="email"
								name="email"
								placeholder="Email"
								value={formData.email}
								onChange={handleInputChange}
								required
							/>
						</label>
					</div>
					<div className="form-row">
						<label className="input-label">
							Login Password
							<input
								type="password"
								name="loginPassword"
								placeholder="Login password"
								value={formData.loginPassword}
								onChange={handleInputChange}
								required
							/>
						</label>
						<label className="input-label">
							Grade Password
							<input
								type="password"
								name="gradePassword"
								placeholder="Grade password"
								value={formData.gradePassword}
								onChange={handleInputChange}
								required
							/>
						</label>
					</div>

					<SubjectsAndDepartments
						subjects={formData.subjects}
						availableSubjects={subjects}
						departments={departments}
						onSubjectsChange={updateSubjects}
					/>

					<div className="modal-buttons">
						<button type="button" onClick={handleSave} className="save-button">
							Save
						</button>
						<button type="button" onClick={onClose} className="cancel-button">
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TeacherModal;
