// utils/dateUtils.js

/**
 * Returns an array of objects representing Monday-Friday of the current workweek
 * (up to today's date), each object containing:
 *  { value: 'YYYY-MM-DD', label: 'WeekdayName' }
 */
export function getWorkWeekDates() {
	const today = new Date();
	const currentDay = today.getDay(); // Sunday=0, Monday=1, ...
	// Find Monday for the current week; if today is Sunday, that Monday is 6 days ago
	const monday = new Date(today);
	monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

	const dates = [];
	for (let i = 0; i < 5; i++) {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);

		// Only add days up to "today" (so future days are excluded)
		if (date <= today) {
			dates.push({
				value: date.toISOString().split("T")[0], // e.g. "2025-02-13"
				label: date.toLocaleDateString("en-US", { weekday: "long" }), // e.g. "Monday"
			});
		}
	}
	return dates;
}

/**
 * Helper for setting a date object to UTC at midnight (0h)
 * and returning an ISO string for consistent storage.
 */
export function toMidnightUTC(dateString) {
	const date = new Date(dateString);
	date.setUTCHours(0, 0, 0, 0);
	return date.toISOString();
}
