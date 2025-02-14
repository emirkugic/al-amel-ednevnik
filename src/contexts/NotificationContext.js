import { createContext, useContext, useState } from "react";
import { Notification } from "../components/ui";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);

	const showNotification = (description, type = "info", duration = 5000) => {
		const id = Date.now();
		setNotifications((prev) => [...prev, { id, description, type }]);

		setTimeout(() => {
			setNotifications((prev) => prev.filter((notif) => notif.id !== id));
		}, duration);
	};

	const removeNotification = (id) => {
		setNotifications((prev) => prev.filter((notif) => notif.id !== id));
	};

	return (
		<NotificationContext.Provider
			value={{ showNotification, removeNotification, notifications }}
		>
			{children}
			<Notification />
		</NotificationContext.Provider>
	);
};

export const useNotification = () => useContext(NotificationContext);
export { NotificationContext };
