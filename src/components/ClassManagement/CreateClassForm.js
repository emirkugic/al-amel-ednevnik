// Components/CreateClassForm.js
import React from "react";
import "./CreateClassForm.css";

const CreateClassForm = ({
	classInput,
	setClassInput,
	subjects,
	isClassDropdownOpen,
	setIsClassDropdownOpen,
	handleCreateClass,
}) => {
	return (
		<div className="form-row">
			<label>
				Grade Level:
				<input
					type="text"
					value={classInput.gradeLevel}
					onChange={(e) =>
						setClassInput({ ...classInput, gradeLevel: e.target.value })
					}
				/>
			</label>
			<div className="dropdown-container">
				<div
					className="dropdown-header"
					onClick={() => setIsClassDropdownOpen((prev) => !prev)}
				>
					{classInput.subjects.length > 0
						? `${classInput.subjects.length} Subjects Selected`
						: "Select Subjects"}
				</div>
				{isClassDropdownOpen && (
					<div className="dropdown-menu">
						{subjects.map((subject) => (
							<label key={subject.id} className="dropdown-item">
								<input
									type="checkbox"
									checked={classInput.subjects.includes(subject.id)}
									onChange={() =>
										setClassInput((prev) => ({
											...prev,
											subjects: prev.subjects.includes(subject.id)
												? prev.subjects.filter((s) => s !== subject.id)
												: [...prev.subjects, subject.id],
										}))
									}
								/>
								{subject.name}
							</label>
						))}
					</div>
				)}
			</div>
			<button className="create-class-button" onClick={handleCreateClass}>
				Create Class
			</button>
		</div>
	);
};

export default CreateClassForm;
