import { useState, useEffect } from "react";
import { fetchTimetable } from "../api/dataApi";

export const useTimetable = () => {
	const [timetable, setTimetable] = useState([]);

	useEffect(() => {
		const loadData = async () => {
			const data = await fetchTimetable();
			setTimetable(data);
		};
		loadData();
	}, []);

	const updateTimetable = (newData) => {
		setTimetable(newData);
	};

	return { timetable, updateTimetable };
};
