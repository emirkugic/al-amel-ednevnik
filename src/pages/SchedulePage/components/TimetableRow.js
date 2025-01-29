import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const TimetableRow = ({ entry }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: entry.SubjectId,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
	};

	return (
		<tr
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="timetable-row"
		>
			<td>{entry.Day}</td>
			<td>{entry.Period}</td>
			<td>{entry.Subject}</td>
			<td>{entry.Teacher}</td>
			<td>{entry.Grade}</td>
		</tr>
	);
};

export default TimetableRow;
