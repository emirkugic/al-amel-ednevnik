import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faExclamationCircle,
	faExclamationTriangle,
	faInfoCircle,
	faCheckCircle,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useNotification } from "../../../contexts";
import "./Notification.css";

const Notification = () => {
	const { notifications, removeNotification } = useNotification();

	const iconMap = {
		error: (
			<FontAwesomeIcon icon={faExclamationCircle} className="icon error-icon" />
		),
		warning: (
			<FontAwesomeIcon
				icon={faExclamationTriangle}
				className="icon warning-icon"
			/>
		),
		info: <FontAwesomeIcon icon={faInfoCircle} className="icon info-icon" />,
		success: (
			<FontAwesomeIcon icon={faCheckCircle} className="icon success-icon" />
		),
	};

	useEffect(() => {
		const timers = notifications.map((notification) =>
			setTimeout(() => removeNotification(notification.id), 5000)
		);
		return () => timers.forEach(clearTimeout);
	}, [notifications, removeNotification]);

	return (
		<div className="notifications-container">
			{notifications.map((notification) => (
				<div
					key={notification.id}
					className={`notification ${notification.type}`}
				>
					{iconMap[notification.type]}
					<div className="notification-content">
						<p>{notification.description}</p>
					</div>
					{/* <button
						className="close-btn"
						onClick={() => removeNotification(notification.id)}
					>
						<FontAwesomeIcon icon={faTimes} />
					</button> */}
				</div>
			))}
		</div>
	);
};

export default Notification;
