import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import "./MobileSwipeDays.css";

/**
 * A horizontal swipeable carousel for the 5 weekdays.
 * Each "slide" is the day card with periods.
 */
const MobileSwipeDays = ({ weekdays, getLogsFor, getTeacherName }) => {
	// 0..4 => Monday..Friday
	const [currentIndex, setCurrentIndex] = useState(() => {
		// If "today" is in range, start there. Otherwise 0 => Monday.
		const todayStr = new Date().toISOString().split("T")[0];
		const foundIndex = weekdays.findIndex(
			(wd) => wd.dateFormatted === todayStr
		);
		return foundIndex >= 0 ? foundIndex : 0;
	});

	// Helper to clamp index to [0..4]
	const clampIndex = (val) => Math.max(0, Math.min(val, 4));

	// react-swipeable config
	const handlers = useSwipeable({
		onSwipedLeft: () => setCurrentIndex((i) => clampIndex(i + 1)),
		onSwipedRight: () => setCurrentIndex((i) => clampIndex(i - 1)),
		trackMouse: true, // allows dragging with mouse too
	});

	return (
		<div className="mobile-swipe-days-container" {...handlers}>
			<div
				className="swipe-track"
				style={{ transform: `translateX(-${currentIndex * 100}%)` }}
			>
				{weekdays.map((day) => (
					<div className="swipe-slide" key={day.dateFormatted}>
						<div className="mobile-day-card">
							{/* Day label */}
							<div className="day-label">
								<div className="day-name">{day.name}</div>
								<div className="date">{day.dateFormatted}</div>
							</div>

							{/* Periods */}
							<div className="periods">
								{Array.from({ length: day.periodCount }, (_, periodIndex) => {
									const period = periodIndex + 1;
									const logsForCell = getLogsFor(day.dateFormatted, period);

									return (
										<div
											key={period}
											className={`timetable-cell ${
												logsForCell.length === 0 ? "missing" : ""
											}`}
										>
											<div className="cell-header">
												<span className="period-number">P{period}</span>
												{logsForCell.length > 1 && (
													<span
														className="duplicate-label"
														title={logsForCell
															.map(
																(log) =>
																	`Title: ${log.lectureTitle}, Seq: ${
																		log.sequence
																	}, Teacher: ${getTeacherName(log.teacherId)}`
															)
															.join("\n")}
													>
														{" - DUPLICATE"}
													</span>
												)}
											</div>

											{logsForCell.length === 0 ? (
												<div className="cell-content no-log">Missing</div>
											) : logsForCell.length === 1 ? (
												<div
													className="cell-content log-entry"
													title={`Seq: ${
														logsForCell[0].sequence
													} | ${getTeacherName(logsForCell[0].teacherId)}`}
												>
													<div className="lecture-title">
														{logsForCell[0].lectureTitle}
													</div>
													<div className="log-details">
														Seq: {logsForCell[0].sequence} |{" "}
														{getTeacherName(logsForCell[0].teacherId)}
													</div>
												</div>
											) : (
												<div
													className="cell-content log-duplicate"
													title={logsForCell
														.map(
															(log) =>
																`Title: ${log.lectureTitle}, Seq: ${
																	log.sequence
																}, Teacher: ${getTeacherName(log.teacherId)}`
														)
														.join("\n")}
												>
													<div className="lecture-title">
														{logsForCell[0].lectureTitle}
													</div>
													<div className="log-details">
														Seq: {logsForCell[0].sequence} |{" "}
														{getTeacherName(logsForCell[0].teacherId)}
													</div>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default MobileSwipeDays;
