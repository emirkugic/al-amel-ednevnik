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
			<label>
				{icon && <FontAwesomeIcon icon={icon} />}
				{label}
			</label>
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
