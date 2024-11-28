import React from "react";
import { useParams } from "react-router-dom";
import LoggedClassesOverview from "../LoggedClassesOverview/LoggedClassesOverview";

const Lectures = () => {
	const { departmentId } = useParams();

	const classLogs = [
		{
			date: "2024-11-01",
			period: "1st Period",
			lectureTitle: "Introduction to Algebra",
			sequence: "1",
			attendance: { present: 28, total: 30, absent: 2 },
			absentStudents: ["John Doe", "Jane Smith"],
		},
		{
			date: "2024-11-02",
			period: "2nd Period",
			lectureTitle: "Linear Equations",
			sequence: "2",
			attendance: { present: 30, total: 30, absent: 0 },
			absentStudents: [],
		},
	];

	return (
		<div>
			{departmentId && (
				<LoggedClassesOverview
					initialLogs={classLogs}
					departmentId={departmentId}
				/>
			)}
		</div>
	);
};

export default Lectures;
