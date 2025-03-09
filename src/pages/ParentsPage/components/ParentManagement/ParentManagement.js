import React, { useState, useEffect } from "react";
import "./ParentManagement.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faPlus,
  faEdit,
  faUser,
  faKey,
  faPhone,
  faSearch,
  faFilter,
  faTimes,
  faUserFriends,
  faEnvelope,
  faShieldAlt,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import TextInput from "../../../../components/ui/TextInput/TextInput";
import useAuth from "../../../../hooks/useAuth";
import useParents from "../../../../hooks/useParents";
import parentApi from "../../../../api/parentApi";

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
  const [showFilters, setShowFilters] = useState(false);

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

  // Toggle sort direction
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
  };

  // Filter and sort parents
  const getFilteredParents = () => {
    let filtered = [...parents];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (parent) => {
          // Add null checks to prevent errors
          const fullName = parent.firstName && parent.lastName ? 
            `${parent.firstName} ${parent.lastName}`.toLowerCase() : '';
          const email = parent.email ? parent.email.toLowerCase() : '';
          const phone = parent.phoneNumber || '';
          
          const searchLower = searchTerm.toLowerCase();
          
          return fullName.includes(searchLower) || 
                 email.includes(searchLower) || 
                 phone.includes(searchTerm);
        }
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "name":
          const nameA = a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : '';
          const nameB = b.firstName && b.lastName ? `${b.firstName} ${b.lastName}` : '';
          compareValue = nameA.localeCompare(nameB);
          break;
        case "email":
          const emailA = a.email || '';
          const emailB = b.email || '';
          compareValue = emailA.localeCompare(emailB);
          break;
        case "phone":
          const phoneA = a.phoneNumber || '';
          const phoneB = b.phoneNumber || '';
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
              <FontAwesomeIcon icon={faSearch} className="parent-mgmt-search-icon" />
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
            
            <div className="parent-mgmt-filter-actions">
              <button
                className={`parent-mgmt-filter-toggle ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FontAwesomeIcon icon={faFilter} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              {searchTerm && (
                <button className="parent-mgmt-clear-filters" onClick={clearFilters}>
                  <FontAwesomeIcon icon={faTimes} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
        <button className="parent-mgmt-add-btn" onClick={() => handleOpenModal()}>
          <FontAwesomeIcon icon={faPlus} /> Add New Parent
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="parent-mgmt-advanced-filters">
          <div className="parent-mgmt-filter-group">
            <label>Sort By</label>
            <div className="parent-mgmt-sort-options">
              <button
                className={`parent-mgmt-sort-btn ${sortBy === "name" ? "active" : ""}`}
                onClick={() => handleSort("name")}
              >
                Name
                {sortBy === "name" && (
                  <FontAwesomeIcon
                    icon={sortDirection === "asc" ? faArrowUp : faArrowDown}
                  />
                )}
              </button>
              <button
                className={`parent-mgmt-sort-btn ${sortBy === "email" ? "active" : ""}`}
                onClick={() => handleSort("email")}
              >
                Email
                {sortBy === "email" && (
                  <FontAwesomeIcon
                    icon={sortDirection === "asc" ? faArrowUp : faArrowDown}
                  />
                )}
              </button>
              <button
                className={`parent-mgmt-sort-btn ${sortBy === "phone" ? "active" : ""}`}
                onClick={() => handleSort("phone")}
              >
                Phone
                {sortBy === "phone" && (
                  <FontAwesomeIcon
                    icon={sortDirection === "asc" ? faArrowUp : faArrowDown}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <tr key={parent.id}>
                  <td className="parent-mgmt-name-cell">
                    <div className="parent-mgmt-name">
                      {parent.firstName} {parent.lastName}
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
                        {parent.phoneNumber}
                      </div>
                    </div>
                  </td>
                  <td className="parent-mgmt-actions-cell">
                    <div className="parent-mgmt-action-buttons">
                      <button
                        className="parent-mgmt-edit-btn"
                        aria-label="Edit Parent"
                        title="Edit Parent"
                        onClick={() => handleOpenModal(parent)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="parent-mgmt-delete-btn"
                        aria-label="Delete Parent"
                        title="Delete Parent"
                        onClick={() => handleDeleteParent(parent.id)}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </td>
                </tr>
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
              <h2>{selectedParent ? `Edit ${selectedParent.firstName} ${selectedParent.lastName}` : "Add New Parent"}</h2>
              <button className="parent-mgmt-close-button" onClick={handleCloseModal}>
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
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="First Name"
                      />
                    </div>

                    <div className="parent-mgmt-form-field">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.surname}
                        onChange={(e) => handleInputChange("surname", e.target.value)}
                        placeholder="Last Name"
                      />
                    </div>

                    <div className="parent-mgmt-form-field">
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input
                        type="text"
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
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
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder={selectedParent ? "Leave blank to keep current" : "New password"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="parent-mgmt-modal-footer">
              <button className="parent-mgmt-cancel-button" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="parent-mgmt-save-button" onClick={handleSaveParent}>
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