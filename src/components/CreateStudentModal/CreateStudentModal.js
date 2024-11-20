import React, { useState, useEffect } from "react";
import parentApi from "../../api/parentApi";
import departmentApi from "../../api/departmentApi";
import studentApi from "../../api/studentApi";
import "./CreateStudentModal.css";

const CreateStudentModal = ({ isOpen, onClose, token }) => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		dateOfBirth: "",
		placeOfBirth: "",
		citizenship: "",
		country: "",
		departmentId: "",
		parentId: "",
	});

	const [parents, setParents] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			const fetchData = async () => {
				try {
					const [parentData, departmentData] = await Promise.all([
						parentApi.getAllParents(token),
						departmentApi.getAllDepartments(token),
					]);
					setParents(parentData);
					setDepartments(departmentData);
				} catch (error) {
					console.error("Error fetching data:", error);
					setError("Failed to load data. Please try again.");
				}
			};

			fetchData();
		}
	}, [isOpen, token]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Ensure the dateOfBirth is formatted properly
		const formattedFormData = {
			...formData,
			dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
		};

		try {
			const response = await studentApi.createStudent(formattedFormData, token);
			alert("Student created successfully!");
			console.log("Created Student:", response);
			setFormData({
				firstName: "",
				lastName: "",
				dateOfBirth: "",
				placeOfBirth: "",
				citizenship: "",
				country: "",
				departmentId: "",
				parentId: "",
			});
			onClose(); // Close the modal
		} catch (error) {
			console.error("Error creating student:", error);
			setError(
				"Failed to create student. Please check the form and try again."
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-container">
				<h2>Create Student</h2>
				{error && <p className="error-message">{error}</p>}
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>First Name:</label>
						<input
							type="text"
							name="firstName"
							value={formData.firstName}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="form-group">
						<label>Last Name:</label>
						<input
							type="text"
							name="lastName"
							value={formData.lastName}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="form-group">
						<label>Date of Birth:</label>
						<input
							type="date"
							name="dateOfBirth"
							value={formData.dateOfBirth}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="form-group">
						<label>Place of Birth:</label>
						<input
							type="text"
							name="placeOfBirth"
							value={formData.placeOfBirth}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="form-group">
						<label>Country:</label>
						<select
							name="country"
							value={formData.country}
							onChange={handleChange}
							required
						>
							<option value="">Select Country</option>
							{["USA", "Germany", "Holland", "France", "Other"].map(
								(country) => (
									<option key={country} value={country}>
										{country}
									</option>
								)
							)}
						</select>
					</div>
					<div className="form-group">
						<label>Citizenship:</label>
						<select
							name="citizenship"
							value={formData.citizenship}
							onChange={handleChange}
							required
						>
							<option value="">Select Citizenship</option>
							{["USA", "Germany", "Holland", "France", "Other"].map(
								(country) => (
									<option key={country} value={country}>
										{country}
									</option>
								)
							)}
						</select>
					</div>
					<div className="form-group">
						<label>Department:</label>
						<select
							name="departmentId"
							value={formData.departmentId}
							onChange={handleChange}
							required
						>
							<option value="">Select Department</option>
							{departments.map((dept) => (
								<option key={dept.id} value={dept.id}>
									{dept.departmentName}
								</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label>Parent:</label>
						<select
							name="parentId"
							value={formData.parentId}
							onChange={handleChange}
							required
						>
							<option value="">Select Parent</option>
							{parents.map((parent) => (
								<option key={parent.id} value={parent.id}>
									{parent.firstName} {parent.lastName}
								</option>
							))}
						</select>
					</div>
					<div className="modal-actions">
						<button type="submit" className="save-button" disabled={loading}>
							{loading ? "Saving..." : "Save"}
						</button>
						<button type="button" className="cancel-button" onClick={onClose}>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateStudentModal;
