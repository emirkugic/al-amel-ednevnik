import React from "react";
import "./TextInput.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TextInput = ({ label, icon, placeholder, value, onChange }) => {
	return (
		<div className="form-group">
			<label>
				{icon && <FontAwesomeIcon icon={icon} />}
				{label}
			</label>
			<input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				className="text-input"
			/>
		</div>
	);
};

export default TextInput;
