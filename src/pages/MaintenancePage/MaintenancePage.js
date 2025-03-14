import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faServer } from "@fortawesome/free-solid-svg-icons";
import "./MaintenancePage.css";

const MaintenancePage = () => {
	const [timeRemaining, setTimeRemaining] = useState(null);
	const [currentTime, setCurrentTime] = useState(new Date());

	// Calculate time remaining until 1am
	useEffect(() => {
		const calculateTimeRemaining = () => {
			const now = new Date();
			setCurrentTime(now);

			// Create a date object for 1am today
			let endTime = new Date();
			endTime.setHours(1, 0, 0, 0);

			// If it's after 1am, set end time to 1am tomorrow
			if (now.getHours() >= 1) {
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
		<div className="maint-container">
			<div className="maint-content">
				<div className="maint-header">
					<FontAwesomeIcon icon={faServer} className="maint-server-icon" />
					<h1 className="maint-title">Scheduled Maintenance</h1>
				</div>

				<div className="maint-message">
					<p>The server is doing a scheduled backup.</p>
					<p>
						We'll be back online at <strong>1:00h</strong>.
					</p>

					<p>We apologize for any inconvenience.</p>

					<div className="maint-status-container">
						<div className="maint-progress-bar">
							<div className="maint-progress"></div>
						</div>
						<div className="maint-progress-label">
							Maintenance in progress...
						</div>
					</div>
				</div>

				<div className="maint-time-info">
					<div className="maint-current-time">
						Current time: {currentTime.toLocaleTimeString()}
					</div>

					{timeRemaining && (
						<div className="maint-countdown-container">
							<h2>System will be available in:</h2>
							<div className="maint-countdown">
								<div className="maint-time-block">
									<div className="maint-time">
										{formatNumber(timeRemaining.hours)}
									</div>
									<div className="maint-label">Hours</div>
								</div>
								<div className="maint-separator">:</div>
								<div className="maint-time-block">
									<div className="maint-time">
										{formatNumber(timeRemaining.minutes)}
									</div>
									<div className="maint-label">Minutes</div>
								</div>
								<div className="maint-separator">:</div>
								<div className="maint-time-block">
									<div className="maint-time">
										{formatNumber(timeRemaining.seconds)}
									</div>
									<div className="maint-label">Seconds</div>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="maint-footer">
					<FontAwesomeIcon icon={faClock} className="maint-clock-icon" />
					<p>Scheduled maintenance occurs daily from 23:00h to 1:00h</p>
				</div>
			</div>
		</div>
	);
};

export default MaintenancePage;
