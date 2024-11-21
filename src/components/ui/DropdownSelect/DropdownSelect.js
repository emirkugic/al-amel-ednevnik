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
	isMulti = false, // New flag to toggle multi-selection
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
				value={
					isMulti
						? options.filter((option) => value?.includes(option.value)) // Handle multi-selection values
						: options.find((option) => option.value === value) // Single selection
				}
				onChange={
					(selected) =>
						isMulti
							? onChange(selected.map((item) => item.value)) // Return array of selected values for multi-selection
							: onChange(selected.value) // Return single value for single selection
				}
				isMulti={isMulti} // Enable multi-selection in the dropdown
			/>
		</div>
	);
};

export default DropdownSelect;
