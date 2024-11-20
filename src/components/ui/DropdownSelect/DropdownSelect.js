// React Imports
import React from "react";

// Third-party Components
import Select from "react-select";

// Icon Imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Style Imports
import "./DropdownSelect.css";

const DropdownSelect = ({
	label,
	icon,
	placeholder,
	value,
	onChange,
	options,
}) => {
	return (
		<div className="form-group">
			<div className="dropdown-select-header">
				{icon && <FontAwesomeIcon icon={icon} className="header-icon" />}
				<span>{label}</span>
			</div>
			<Select
				options={options}
				placeholder={placeholder}
				value={options.find((option) => option.value === value)}
				onChange={onChange}
			/>
		</div>
	);
};

export default DropdownSelect;
