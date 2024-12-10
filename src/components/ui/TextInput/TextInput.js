import React, { useState } from "react";
import "./TextInput.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const TextInput = ({
	label,
	icon,
	placeholder,
	value,
	onChange,
	type = "text",
}) => {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const togglePasswordVisibility = () => {
		setIsPasswordVisible(!isPasswordVisible);
	};

	return (
		<div className="form-group">
			<div className="text-input-header">
				{icon && <FontAwesomeIcon icon={icon} className="header-icon" />}
				<span>{label}</span>
			</div>
			<div className="text-input-container">
				<input
					type={type === "password" && !isPasswordVisible ? "password" : "text"}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					className="text-input"
				/>
				{type === "password" && (
					<FontAwesomeIcon
						icon={isPasswordVisible ? faEyeSlash : faEye}
						className="password-toggle-icon"
						onClick={togglePasswordVisibility}
					/>
				)}
			</div>
		</div>
	);
};

export default TextInput;
