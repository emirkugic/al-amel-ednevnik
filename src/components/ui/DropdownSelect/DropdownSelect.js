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
	isMulti = false,
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
						? options.filter((option) => value?.includes(option.value))
						: options.find((option) => option.value === value)
				}
				onChange={(selected) =>
					isMulti
						? onChange(selected.map((item) => item.value))
						: onChange(selected.value)
				}
				isMulti={isMulti}
			/>
		</div>
	);
};

export default DropdownSelect;
