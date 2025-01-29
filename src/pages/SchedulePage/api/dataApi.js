import timetableData from "../timetable.json";

export const fetchTimetable = async () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(timetableData.Data);
		}, 500);
	});
};
