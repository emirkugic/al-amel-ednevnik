import React, { useState } from "react";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

import AssessmentGradesModal from "../../pages/Assessments/components/AssessmentGradesModal/AssessmentGradesModal";
import AssessmentManagement from "../../pages/Assessments/components/AssessmentManagement/AssessmentManagement";
import ClassLogForm from "../ClassLogForm/ClassLogForm";
import GradesModal from "../GradesModal/GradesModal";
import LoginForm from "../LoginForm/LoginForm";
import StudentCard from "../StudentCard/StudentCard";
import StudentCardList from "../StudentCardList/StudentCardList";
import SubjectList from "../SubjectList/SubjectList";
// ui
import AbsentStudentsSelect from "../ui/AbsentStudentsSelect/AbsentStudentsSelect";
import DropdownSelect from "../ui/DropdownSelect/DropdownSelect";
import GradesList from "../ui/GradesList/GradesList";
import Notification from "../ui/Notification/Notification";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton";
import SubjectPill from "../ui/SubjectPill/SubjectPill";
import TextInput from "../ui/TextInput/TextInput";
import DesktopSidebarButton from "../ui/DesktopSidebarButton/DesktopSidebarButton";

import { logo } from "../../assets/";

const Develop = () => {
	const [isGradesModalOpen, setGradesModalOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);

	const handleButtonClick = (buttonName) => {
		console.log(`${buttonName} button clicked`);
	};

	const handleNotification = () => {
		const id = Date.now();
		setNotifications((prev) => [
			...prev,
			{ id, type: "info", description: "This is a test notification" },
		]);
		setTimeout(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		}, 3000);
	};

	// Default data for components
	const students = [
		{
			id: 1,
			name: "John Doe",
			imageUrl: logo,
		},
	];
	const grades = [{ subject: "Math", score: 85 }];

	// States for AbsentStudentsSelect
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentInput, setStudentInput] = useState(null);
	const [notification, setNotification] = useState("");

	// Options for the creatable select dropdown
	const studentOptions = students.map((student) => ({
		value: student.name,
		label: student.name,
	}));

	return (
		<div>
			<h2>Development</h2>
			<p>Welcome to Development page</p>
			<p>All components and elements:</p>
			<br />
			<br />
			<br />

			{/* Display individual components */}
			<DesktopSidebarButton
				title="Develop"
				icon={faSignOutAlt}
				route="/develop"
				isActive={false}
				onClick={() => handleButtonClick("Develop")}
			/>
			<PrimaryButton title="Primary Button" />
			<SecondaryButton title="Secondary Button" />
			<TextInput label="Text Input" placeholder="Enter text here" />
			<TextInput
				label={"Password"}
				type="password"
				placeholder="Enter password"
			/>
			<DropdownSelect
				label="Dropdown Select"
				placeholder="Select an option"
				options={[
					{ value: "option1", label: "Option 1" },
					{ value: "option2", label: "Option 2" },
				]}
			/>

			{/* AbsentStudentsSelect */}
			<AbsentStudentsSelect
				studentOptions={studentOptions}
				absentStudents={absentStudents}
				setAbsentStudents={setAbsentStudents}
				studentInput={studentInput}
				setStudentInput={setStudentInput}
				setNotification={setNotification}
			/>

			{/* Display notification */}
			{notification && <p>{notification}</p>}

			{/* <GradesList
				student={{
					id: "001",
					name: "John Doe",
					imageUrl: logo,
					grades: grades,
				}}
				isOpen={true}
				onClose={() => {}}
			/> */}

			<SubjectPill color="#3498db" title="Mathematics" />

			<Notification
				notifications={notifications}
				removeNotification={() => {}}
			/>

			<button onClick={handleNotification}>Trigger Notification</button>

			<SubjectList />

			<StudentCardList students={students} />
			<StudentCard name="John Doe" imageUrl={logo} />

			<ClassLogForm />
			<LoginForm />

			{/* <AssessmentGradesModal
				assessment={{ name: "Test", type: "exam", points: 50 }}
				isOpen={true}
				onClose={() => {}}
			/> */}

			<button onClick={() => setGradesModalOpen(true)}>
				Open Grades Modal
			</button>

			<GradesModal
				student={{
					id: "STU001",
					name: "Emma Thompson",
					imageUrl: logo,
				}}
				isOpen={isGradesModalOpen}
				onClose={() => setGradesModalOpen(false)}
			/>

			<AssessmentManagement />
		</div>
	);
};

export default Develop;
