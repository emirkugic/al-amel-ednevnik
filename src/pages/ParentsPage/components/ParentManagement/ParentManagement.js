import React, { useState, useEffect } from "react";
import "./ParentManagement.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTrashAlt,
	faPlus,
	faEdit,
	faPhone,
	faSearch,
	faUserFriends,
	faEnvelope,
	faChild,
	faChevronDown,
	faChevronUp,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../../../hooks/useAuth";
import useParents from "../../../../hooks/useParents";
import parentApi from "../../../../api/parentApi";
import studentApi from "../../../../api/studentApi";

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
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("name");
	const [sortDirection, setSortDirection] = useState("asc");
	const [expandedParent, setExpandedParent] = useState(null);
	const [childrenByParent, setChildrenByParent] = useState({});
	const [loadingStudents, setLoadingStudents] = useState(true);

	const handleInputChange = (name, value) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const clearFilters = () => {
		setSearchTerm("");
		setSortBy("name");
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
			alert(`Error: ${error.message || "Failed to save parent"}`);
		}
	};

	const handleDeleteParent = async (id) => {
		if (window.confirm("Are you sure you want to delete this parent?")) {
			try {
				await parentApi.deleteParent(id, user.token);
				deleteParent(id);
			} catch (error) {
				console.error("Error deleting parent:", error);
				alert(`Error: ${error.message || "Failed to delete parent"}`);
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
						password: "", // Don't show current password
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

	// Fetch all students when component loads and organize them by parent
	useEffect(() => {
		const fetchAllStudents = async () => {
			if (!user?.token) return;

			try {
				setLoadingStudents(true);
				const allStudents = await studentApi.getAllStudents(user.token);

				// Create a mapping of parentId to children
				const studentsByParent = {};

				allStudents.forEach((student) => {
					if (student.parentId) {
						if (!studentsByParent[student.parentId]) {
							studentsByParent[student.parentId] = [];
						}
						studentsByParent[student.parentId].push(student);
					}
				});

				setChildrenByParent(studentsByParent);
			} catch (error) {
				console.error("Error fetching students:", error);
			} finally {
				setLoadingStudents(false);
			}
		};

		fetchAllStudents();
	}, [user?.token]);

	// Toggle expanded view for a parent
	const toggleExpand = (parentId) => {
		setExpandedParent(expandedParent === parentId ? null : parentId);
	};

	// Toggle sort direction
	const handleSort = (column) => {
		if (sortBy === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortDirection("asc");
		}
	};

	// Filter and sort parents
	const getFilteredParents = () => {
		let filtered = [...parents];

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter((parent) => {
				// Add null checks to prevent errors
				const fullName =
					parent.firstName && parent.lastName
						? `${parent.firstName} ${parent.lastName}`.toLowerCase()
						: "";
				const email = parent.email ? parent.email.toLowerCase() : "";
				const phone = parent.phoneNumber || "";

				const searchLower = searchTerm.toLowerCase();

				// Check if parent matches search criteria
				const parentMatches =
					fullName.includes(searchLower) ||
					email.includes(searchLower) ||
					phone.includes(searchTerm);

				// Check if any of the parent's children match search criteria
				const childrenMatch =
					childrenByParent[parent.id]?.some((child) => {
						const childFullName =
							child.firstName && child.lastName
								? `${child.firstName} ${child.lastName}`.toLowerCase()
								: "";
						return childFullName.includes(searchLower);
					}) || false;

				// Return true if either parent or any of their children match
				return parentMatches || childrenMatch;
			});
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let compareValue = 0;

			switch (sortBy) {
				case "name":
					const nameA =
						a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : "";
					const nameB =
						b.firstName && b.lastName ? `${b.firstName} ${b.lastName}` : "";
					compareValue = nameA.localeCompare(nameB);
					break;
				case "email":
					const emailA = a.email || "";
					const emailB = b.email || "";
					compareValue = emailA.localeCompare(emailB);
					break;
				case "phone":
					const phoneA = a.phoneNumber || "";
					const phoneB = b.phoneNumber || "";
					compareValue = phoneA.localeCompare(phoneB);
					break;
				default:
					compareValue = 0;
			}

			return sortDirection === "asc" ? compareValue : -compareValue;
		});

		return filtered;
	};

	if (loading) {
		return (
			<div className="parent-mgmt-dashboard-card parent-mgmt-loading-card">
				<div className="parent-mgmt-loading-spinner"></div>
				<p>Loading parent data...</p>
			</div>
		);
	}

	const filteredParents = getFilteredParents();

	return (
		<div className="parent-mgmt-dashboard-card">
			{/* Header */}
			<div className="parent-mgmt-header">
				<div className="parent-mgmt-title">
					<div className="parent-mgmt-search-filter-row">
						<span className="parent-mgmt-stat-pill">
							<FontAwesomeIcon icon={faUserFriends} /> {parents.length} parents
						</span>

						<div className="parent-mgmt-search-bar">
							<FontAwesomeIcon
								icon={faSearch}
								className="parent-mgmt-search-icon"
							/>
							<input
								type="text"
								placeholder="Search parents..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							{searchTerm && (
								<button
									className="parent-mgmt-clear-search"
									onClick={() => setSearchTerm("")}
								>
									<FontAwesomeIcon icon={faTimes} />
								</button>
							)}
						</div>
					</div>
				</div>
				<button
					className="parent-mgmt-add-btn"
					onClick={() => handleOpenModal()}
				>
					<FontAwesomeIcon icon={faPlus} /> Add New Parent
				</button>
			</div>

			{/* Parent Table */}
			{filteredParents.length > 0 ? (
				<div className="parent-mgmt-table-container">
					<table className="parent-mgmt-table">
						<thead>
							<tr>
								<th>Parent</th>
								<th>Email</th>
								<th>Phone</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredParents.map((parent) => (
								<React.Fragment key={parent.id}>
									<tr
										className={
											expandedParent === parent.id ? "parent-mgmt-expanded" : ""
										}
										onClick={() => toggleExpand(parent.id)}
									>
										<td className="parent-mgmt-name-cell">
											<div className="parent-mgmt-name">
												<div className="parent-mgmt-name-content">
													{parent.firstName} {parent.lastName}
												</div>
												<FontAwesomeIcon
													icon={
														expandedParent === parent.id
															? faChevronUp
															: faChevronDown
													}
													className="parent-mgmt-expand-icon"
												/>
											</div>
										</td>
										<td>
											<div className="parent-mgmt-contact-info">
												<div className="parent-mgmt-email-display">
													<FontAwesomeIcon
														icon={faEnvelope}
														className="parent-mgmt-contact-icon"
													/>
													{parent.email}
												</div>
											</div>
										</td>
										<td className="parent-mgmt-phone-cell">
											<div className="parent-mgmt-contact-info">
												<div className="parent-mgmt-phone-display">
													<FontAwesomeIcon
														icon={faPhone}
														className="parent-mgmt-contact-icon"
													/>
													{parent.phoneNumber || "N/A"}
												</div>
											</div>
										</td>
										<td className="parent-mgmt-actions-cell">
											<div className="parent-mgmt-action-buttons">
												<button
													className="parent-mgmt-edit-btn"
													aria-label="Edit Parent"
													title="Edit Parent"
													onClick={(e) => {
														e.stopPropagation();
														handleOpenModal(parent);
													}}
												>
													<FontAwesomeIcon icon={faEdit} />
												</button>
												<button
													className="parent-mgmt-delete-btn"
													aria-label="Delete Parent"
													title="Delete Parent"
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteParent(parent.id);
													}}
												>
													<FontAwesomeIcon icon={faTrashAlt} />
												</button>
											</div>
										</td>
									</tr>

									{/* Expanded Children View */}
									{expandedParent === parent.id && (
										<tr className="parent-mgmt-details-row">
											<td colSpan="4">
												<div className="parent-mgmt-children-details">
													<h4>
														<FontAwesomeIcon
															icon={faChild}
															className="parent-mgmt-child-icon"
														/>
														Children
													</h4>
													{loadingStudents ? (
														<div className="parent-mgmt-loading-children">
															<div className="parent-mgmt-mini-spinner"></div>
															<span>Loading children...</span>
														</div>
													) : childrenByParent[parent.id]?.length > 0 ? (
														<table className="parent-mgmt-children-table">
															<thead>
																<tr>
																	<th>Name</th>
																	<th>Date of Birth</th>
																	<th>Place of Birth</th>
																	<th>Citizenship</th>
																</tr>
															</thead>
															<tbody>
																{childrenByParent[parent.id].map((child) => (
																	<tr key={child.id}>
																		<td>
																			<div className="parent-mgmt-child-name">
																				<FontAwesomeIcon
																					icon={faChild}
																					className="parent-mgmt-child-icon-small"
																				/>
																				{child.firstName} {child.lastName}
																			</div>
																		</td>
																		<td>
																			{new Date(
																				child.dateOfBirth
																			).toLocaleDateString()}
																		</td>
																		<td>{child.placeOfBirth}</td>
																		<td>{child.citizenship}</td>
																	</tr>
																))}
															</tbody>
														</table>
													) : (
														<div className="parent-mgmt-no-children">
															No children found
														</div>
													)}
												</div>
											</td>
										</tr>
									)}
								</React.Fragment>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className="parent-mgmt-no-results">
					<p>No parents match your search criteria.</p>
					<button onClick={clearFilters}>
						<FontAwesomeIcon icon={faTimes} /> Clear Filters
					</button>
				</div>
			)}

			{/* Parent Edit Modal */}
			{isModalOpen && (
				<div className="parent-mgmt-modal-backdrop">
					<div className="parent-mgmt-modal-container">
						<header className="parent-mgmt-modal-header">
							<h2>
								{selectedParent
									? `Edit ${selectedParent.firstName} ${selectedParent.lastName}`
									: "Add New Parent"}
							</h2>
							<button
								className="parent-mgmt-close-button"
								onClick={handleCloseModal}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</header>

						<div className="parent-mgmt-modal-body">
							<div className="parent-mgmt-content-area">
								<div className="parent-mgmt-form-section">
									<h3>Parent Information</h3>
									<div className="parent-mgmt-form-grid">
										<div className="parent-mgmt-form-field">
											<label htmlFor="firstName">First Name</label>
											<input
												type="text"
												id="firstName"
												value={formData.name}
												onChange={(e) =>
													handleInputChange("name", e.target.value)
												}
												placeholder="First Name"
											/>
										</div>

										<div className="parent-mgmt-form-field">
											<label htmlFor="lastName">Last Name</label>
											<input
												type="text"
												id="lastName"
												value={formData.surname}
												onChange={(e) =>
													handleInputChange("surname", e.target.value)
												}
												placeholder="Last Name"
											/>
										</div>

										<div className="parent-mgmt-form-field">
											<label htmlFor="phoneNumber">Phone Number</label>
											<input
												type="text"
												id="phoneNumber"
												value={formData.phoneNumber}
												onChange={(e) =>
													handleInputChange("phoneNumber", e.target.value)
												}
												placeholder="Phone Number"
											/>
										</div>

										<div className="parent-mgmt-form-field">
											<label htmlFor="email">Email Address</label>
											<input
												type="email"
												id="email"
												value={`${formData.name.toLowerCase()}.${formData.surname.toLowerCase()}@example.com`}
												readOnly
												className="parent-mgmt-readonly-input"
												placeholder="Email will be auto-generated"
											/>
										</div>
									</div>
								</div>

								<div className="parent-mgmt-form-section">
									<h3>Security</h3>
									<div className="parent-mgmt-form-grid">
										<div className="parent-mgmt-form-field">
											<label htmlFor="password">Password</label>
											<div className="parent-mgmt-password-input">
												<input
													type="password"
													id="password"
													value={formData.password}
													onChange={(e) =>
														handleInputChange("password", e.target.value)
													}
													placeholder={
														selectedParent
															? "Leave blank to keep current"
															: "New password"
													}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<footer className="parent-mgmt-modal-footer">
							<button
								className="parent-mgmt-cancel-button"
								onClick={handleCloseModal}
							>
								Cancel
							</button>
							<button
								className="parent-mgmt-save-button"
								onClick={handleSaveParent}
							>
								Save Changes
							</button>
						</footer>
					</div>
				</div>
			)}
		</div>
	);
};

export default ParentManagement;
