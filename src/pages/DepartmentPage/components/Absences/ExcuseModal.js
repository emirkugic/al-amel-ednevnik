import React from "react";
import "./ExcuseModal.css";

const ExcuseModal = ({
	open,
	title,
	reason,
	onChange,
	onCancel,
	onSave,
	disabled,
}) => {
	if (!open) return null;

	return (
		<div className="modal-backdrop">
			<div className="modal">
				<h3>{title}</h3>
				<label>Reason</label>
				<textarea
					value={reason}
					onChange={onChange}
					placeholder="Enter a reason (required)"
				/>
				<div className="modal-buttons">
					<button className="btn-cancel" onClick={onCancel}>
						Cancel
					</button>
					<button className="btn-primary" onClick={onSave} disabled={disabled}>
						Save
					</button>
				</div>
			</div>
		</div>
	);
};

export default ExcuseModal;
