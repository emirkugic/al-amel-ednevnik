import React from "react";
import Select from "react-select";

const CreateClassForm = ({
	classInput,
	setClassInput,
	subjects,
	handleCreateClass,
}) => {
	const subjectOptions = subjects.map((subject) => ({
		value: subject.id,
		label: subject.name,
	}));

	const handleSubjectsChange = (selectedOptions) => {
		const selectedSubjects = selectedOptions
			? selectedOptions.map((opt) => opt.value)
			: [];
		setClassInput({ ...classInput, subjects: selectedSubjects });
	};

	const customStyles = {
		container: (base) => ({
			...base,
			marginTop: "5px",
			width: "100%", // Ensures the dropdown matches the container width
		}),
		control: (base) => ({
			...base,
			minHeight: "38px", // Matches the input height
		}),
		menu: (base) => ({
			...base,
			width: "100%", // Prevents the menu from growing wider
		}),
		multiValue: (base) => ({
			...base,
			backgroundColor: "#e9ecef", // Better background for selected items
		}),
		multiValueLabel: (base) => ({
			...base,
			color: "#495057", // Text color for selected items
		}),
		multiValueRemove: (base) => ({
			...base,
			color: "#dc3545", // Red color for remove button
			":hover": {
				backgroundColor: "#f8d7da",
				color: "#a71d2a",
			},
		}),
	};

	return (
		<div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
			<h3>Create a New Class</h3>
			<div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
				<div style={{ flex: 1 }}>
					<label>
						Grade Level:
						<input
							type="text"
							value={classInput.gradeLevel}
							onChange={(e) =>
								setClassInput({ ...classInput, gradeLevel: e.target.value })
							}
							style={{
								width: "100%",
								padding: "8px",
								borderRadius: "4px",
								border: "1px solid #ccc",
								marginTop: "5px",
								height: "38px", // Matches the dropdown height
							}}
						/>
					</label>
				</div>
				<div style={{ flex: 2 }}>
					<label>
						Subjects:
						<Select
							options={subjectOptions}
							isMulti
							value={subjectOptions.filter((opt) =>
								classInput.subjects.includes(opt.value)
							)}
							onChange={handleSubjectsChange}
							closeMenuOnSelect={false}
							styles={customStyles}
						/>
					</label>
				</div>
				<button
					onClick={handleCreateClass}
					style={{
						padding: "10px 15px",
						backgroundColor: "#007bff",
						color: "#fff",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
						whiteSpace: "nowrap",
						height: "38px", // Matches the input height
					}}
				>
					Create Class
				</button>
			</div>
		</div>
	);
};

export default CreateClassForm;
