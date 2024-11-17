import React, { useState, useEffect } from "react";
import "./ParentManagement.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import parentApi from "../../api/parentApi"; // Assume we have a parent API module

const ParentManagement = () => {
	const { user } = useAuth(); // Access user context for authentication
	const [parents, setParents] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		surname: "",
		username: "",
		password: "",
		phoneNumber: "",
	});
	const [selectedParent, setSelectedParent] = useState(null);

	useEffect(() => {
		if (!user || !user.token) return;

		const fetchParents = async () => {
			try {
				const data = await parentApi.getAllParents(user.token); // Fetch all parents
				setParents(data);
			} catch (error) {
				console.error("Error fetching parents:", error);
			}
		};

		fetchParents();
	}, [user]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
			username: `${prev.name}${prev.surname}`.replace(/\s+/g, ""), // Auto-generate username
		}));
	};

	const handleSaveParent = async () => {
		if (
			!formData.name ||
			!formData.surname ||
			!formData.password ||
			!formData.phoneNumber
		) {
			alert("All fields are required!");
			return;
		}

		const parentData = {
			firstName: formData.name,
			lastName: formData.surname,
			email: `${formData.name.toLowerCase()}.${formData.surname.toLowerCase()}@example.com`, // Generate a default email if not provided
			password: formData.password,
			phoneNumber: formData.phoneNumber,
		};

		try {
			if (selectedParent) {
				// Update existing parent
				await parentApi.updateParent(selectedParent.id, parentData, user.token);
				setParents((prev) =>
					prev.map((parent) =>
						parent.id === selectedParent.id
							? { ...parent, ...parentData }
							: parent
					)
				);
			} else {
				// Create new parent
				const newParent = await parentApi.createParent(parentData, user.token);
				setParents((prev) => [...prev, newParent]);
			}

			handleCloseModal();
		} catch (error) {
			console.error("Error saving parent:", error);
		}
	};

	const handleDeleteParent = async (id) => {
		if (window.confirm("Are you sure you want to delete this parent?")) {
			try {
				await parentApi.deleteParent(id, user.token);
				setParents((prev) => prev.filter((parent) => parent.id !== id));
			} catch (error) {
				console.error("Error deleting parent:", error);
			}
		}
	};

	const handleOpenModal = (parent = null) => {
		setSelectedParent(parent);
		setFormData(
			parent
				? { ...parent }
				: {
						name: "",
						surname: "",
						username: "",
						password: "",
						phoneNumber: "",
				  }
		);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setSelectedParent(null);
		setIsModalOpen(false);
	};

	return (
		<div className="parent-management">
			<div className="header">
				<h2>Parent Management</h2>
				<button className="add-parent" onClick={() => handleOpenModal()}>
					<FontAwesomeIcon icon={faPlus} /> Add Parent
				</button>
			</div>

			<div className="parent-list">
				{parents.map((parent) => (
					<div className="parent-card" key={parent.id}>
						<div className="parent-info">
							<h3>{`${parent.firstName} ${parent.lastName}`}</h3>
							<p>Email: {parent.email}</p>
							<p>Phone: {parent.phoneNumber}</p>
						</div>
						<div className="parent-actions">
							<button
								className="edit-button"
								onClick={() => handleOpenModal(parent)}
							>
								<FontAwesomeIcon icon={faEdit} />
							</button>
							<button
								className="delete-button"
								onClick={() => handleDeleteParent(parent.id)}
							>
								<FontAwesomeIcon icon={faTrashAlt} />
							</button>
						</div>
					</div>
				))}
			</div>

			{isModalOpen && (
				<div className="modal-overlay">
					<div className="modal-content">
						<h3>{selectedParent ? "Edit Parent" : "Add Parent"}</h3>
						<form onSubmit={(e) => e.preventDefault()}>
							<div className="form-row">
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
									Surname:
									<input
										type="text"
										name="surname"
										value={formData.surname}
										onChange={handleInputChange}
										required
									/>
								</label>
							</div>
							<div className="form-row">
								<label>
									Password:
									<input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										required
									/>
								</label>
								<label>
									Phone Number:
									<input
										type="text"
										name="phoneNumber"
										value={formData.phoneNumber}
										onChange={handleInputChange}
										required
									/>
								</label>
							</div>
							<div className="modal-buttons">
								<button
									type="button"
									className="save-button"
									onClick={handleSaveParent}
								>
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

export default ParentManagement;
