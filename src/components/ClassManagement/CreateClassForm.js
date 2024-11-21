import React from "react";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";
import TextInput from "../ui/TextInput/TextInput";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton"; // Assuming you're using this for the button styling

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

	const handleSubjectsChange = (selectedSubjects) => {
		setClassInput({
			...classInput,
			subjects: selectedSubjects, // Already returns an array of selected values
		});
	};

	return (
		<div className="create-class-form">
			<h3>Create a New Class</h3>
			<div className="form-row">
				<div className="form-group">
					<TextInput
						label="Grade Level"
						placeholder="Enter grade level"
						value={classInput.gradeLevel}
						onChange={(e) =>
							setClassInput({ ...classInput, gradeLevel: e.target.value })
						}
					/>
				</div>
				<div className="form-group">
					<DropdownSelect
						label="Subjects"
						placeholder="Select subjects"
						options={subjectOptions}
						value={classInput.subjects}
						onChange={handleSubjectsChange}
						isMulti={true}
					/>
				</div>
				<div>
					<PrimaryButton
						title="Create Class"
						onClick={handleCreateClass}
						className="create-class-button"
					/>
				</div>
			</div>
		</div>
	);
};

export default CreateClassForm;
