import React from "react";
import { useParams } from "react-router-dom";
import LoggedClassesOverview from "../components/LoggedClassesOverview/LoggedClassesOverview";

const Lectures = () => {
	const { departmentId } = useParams();

	return <div>{<LoggedClassesOverview departmentId={departmentId} />}</div>;
};

export default Lectures;
