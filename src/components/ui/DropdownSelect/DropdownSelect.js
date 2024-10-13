import React from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
