import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "./TeacherModal.css";

const TeacherModal = ({ teacher, formData, onClose, onSave, onChange }) => {
	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<h3>{teacher ? "Edit Teacher" : "Add Teacher"}</h3>
				<div className="form-group">
					<label>First Name</label>
					<input
						name="firstName"
						value={formData.firstName}
						onChange={onChange}
					/>
				</div>
				<div className="form-group">
					<label>Last Name</label>
					<input
						name="lastName"
						value={formData.lastName}
						onChange={onChange}
					/>
				</div>
				<div className="form-group">
					<label>Email</label>
					<input name="email" value={formData.email} onChange={onChange} />
				</div>
				<div className="form-group">
					<label>Login Password</label>
					<input
						type="password"
						name="loginPassword"
						value={formData.loginPassword}
						onChange={onChange}
					/>
				</div>
				<div className="form-group">
					<label>Grade Password</label>
					<input
						type="password"
						name="gradePassword"
						value={formData.gradePassword}
						onChange={onChange}
					/>
				</div>
				<div className="form-group checkbox-group">
					<label htmlFor="isAdmin">Is Admin?</label>
					<input
						id="isAdmin"
						name="isAdmin"
						type="checkbox"
						checked={formData.isAdmin}
						onChange={onChange}
					/>
				</div>
				<div className="modal-actions">
					<button className="btn primary-btn" onClick={onSave}>
						Save
					</button>
					<button className="btn secondary-btn" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default TeacherModal;
