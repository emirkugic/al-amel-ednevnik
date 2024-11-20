import React, { useState } from "react";
import "./ParentManagement.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTrashAlt,
	faPlus,
	faEdit,
	faUser,
	faKey,
	faPhone,
} from "@fortawesome/free-solid-svg-icons";
import TextInput from "../ui/TextInput/TextInput"; // Assuming this is your custom input component
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton"; // Assuming this is your custom button component
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton"; // Assuming this is your custom button component
import useAuth from "../../hooks/useAuth";
import useParents from "../../hooks/useParents";
import parentApi from "../../api/parentApi";

const ParentManagement = () => {
	const { user } = useAuth();
	const { parents, loading, error, addParent, updateParent, deleteParent } =
		useParents(user?.token);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		surname: "",
		password: "",
		phoneNumber: "",
	});
	const [selectedParent, setSelectedParent] = useState(null);

	const handleInputChange = (name, value) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
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
			email: `${formData.name.toLowerCase()}.${formData.surname.toLowerCase()}@example.com`,
			password: formData.password,
			phoneNumber: formData.phoneNumber,
		};

		try {
			if (selectedParent) {
				// Update existing parent
				const updatedParent = await parentApi.updateParent(
					selectedParent.id,
					parentData,
					user.token
				);
				updateParent(updatedParent);
			} else {
				// Create new parent
				const newParent = await parentApi.createParent(parentData, user.token);
				addParent(newParent);
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
				deleteParent(id);
			} catch (error) {
				console.error("Error deleting parent:", error);
			}
		}
	};

	const handleOpenModal = (parent = null) => {
		setSelectedParent(parent);
		setFormData(
			parent
				? {
						name: parent.firstName,
						surname: parent.lastName,
						password: "",
						phoneNumber: parent.phoneNumber,
				  }
				: { name: "", surname: "", password: "", phoneNumber: "" }
		);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setSelectedParent(null);
		setIsModalOpen(false);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error loading parents: {error.message}</div>;
	}

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
						<h3>{selectedParent ? "Edit Parent" : "Create a parent"}</h3>
						<form onSubmit={(e) => e.preventDefault()}>
							<TextInput
								label="Name"
								icon={faUser}
								placeholder="Enter first name"
								value={formData.name}
								onChange={(e) => handleInputChange("name", e.target.value)}
							/>
							<TextInput
								label="Surname"
								icon={faUser}
								placeholder="Enter last name"
								value={formData.surname}
								onChange={(e) => handleInputChange("surname", e.target.value)}
							/>
							<TextInput
								label="Password"
								icon={faKey}
								placeholder="Enter password"
								value={formData.password}
								onChange={(e) => handleInputChange("password", e.target.value)}
								type="password"
							/>
							<TextInput
								label="Phone Number"
								icon={faPhone}
								placeholder="Enter phone number"
								value={formData.phoneNumber}
								onChange={(e) =>
									handleInputChange("phoneNumber", e.target.value)
								}
							/>
							<div className="modal-buttons">
								<PrimaryButton title="Save" onClick={handleSaveParent} />
								<SecondaryButton title="Cancel" onClick={handleCloseModal} />
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default ParentManagement;
