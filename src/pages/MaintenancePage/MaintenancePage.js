import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faServer } from "@fortawesome/free-solid-svg-icons";
import "./MaintenancePage.css";

const MaintenancePage = () => {
	const [timeRemaining, setTimeRemaining] = useState(null);
	const [currentTime, setCurrentTime] = useState(new Date());

	// Calculate time remaining until 2am
	useEffect(() => {
		const calculateTimeRemaining = () => {
			const now = new Date();
			setCurrentTime(now);

			// Create a date object for 2am today
			let endTime = new Date();
			endTime.setHours(2, 0, 0, 0);

			// If it's after 2am, set end time to 2am tomorrow
			if (now.getHours() >= 2) {
				endTime.setDate(endTime.getDate() + 1);
			}

			// Calculate the time difference in milliseconds
			const diff = endTime - now;

			// Convert to hours, minutes, seconds
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			setTimeRemaining({ hours, minutes, seconds });
		};

		calculateTimeRemaining();
		const timer = setInterval(calculateTimeRemaining, 1000);

		return () => clearInterval(timer);
	}, []);

	// Format to 2-digit display
	const formatNumber = (num) => {
		return num.toString().padStart(2, "0");
	};

	return (
		<div className="maintenance-container">
			<div className="maintenance-content">
				<div className="maintenance-header">
					<FontAwesomeIcon icon={faServer} className="server-icon" />
					<h1 className="maintenance-title">Scheduled Maintenance</h1>
				</div>

				<div className="maintenance-message">
					<p>The server is doing a scheduled backup.</p>
					<p>
						We'll be back online at <strong>1:00h</strong>.
					</p>

					<p>We apologize for any inconvenience.</p>

					<div className="status-container">
						<div className="progress-bar">
							<div className="progress"></div>
						</div>
						<div className="progress-label">Maintenance in progress...</div>
					</div>
				</div>

				<div className="time-info">
					<div className="current-time">
						Current time: {currentTime.toLocaleTimeString()}
					</div>

					{timeRemaining && (
						<div className="countdown-container">
							<h2>System will be available in:</h2>
							<div className="countdown">
								<div className="time-block">
									<div className="time">
										{formatNumber(timeRemaining.hours)}
									</div>
									<div className="label">Hours</div>
								</div>
								<div className="separator">:</div>
								<div className="time-block">
									<div className="time">
										{formatNumber(timeRemaining.minutes)}
									</div>
									<div className="label">Minutes</div>
								</div>
								<div className="separator">:</div>
								<div className="time-block">
									<div className="time">
										{formatNumber(timeRemaining.seconds)}
									</div>
									<div className="label">Seconds</div>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="maintenance-footer">
					<FontAwesomeIcon icon={faClock} className="clock-icon" />
					<p>Scheduled maintenance occurs daily from 23:00h to 1:00h</p>
				</div>
			</div>
		</div>
	);
};

export default MaintenancePage;
