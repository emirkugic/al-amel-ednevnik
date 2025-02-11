import React, { useState } from "react";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import TextInput from "../../../../components/ui/TextInput/TextInput";
import PrimaryButton from "../../../../components/ui/PrimaryButton/PrimaryButton";
import SecondaryButton from "../../../../components/ui/SecondaryButton/SecondaryButton";
import "./ForcePasswordChangeModal.css";

const ForcePasswordChangeModal = ({ onClose, user }) => {
	const [newPassword, setNewPassword] = useState("");
	const [notification, setNotification] = useState("");

	const handlePasswordChange = async () => {
		if (!newPassword) {
			setNotification("Please enter a new password.");
			return;
		}

		try {
			const response = await fetch(
				`https://al-amel-api.onrender.com/api/Teacher/${user.id}/update-credentials`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${user.token}`,
					},
					body: JSON.stringify({
						newEmail: user.email,
						newPassword: newPassword,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update password. Please try again.");
			}

			setNotification("✅ Password updated successfully! Redirecting...");
			setTimeout(() => {
				onClose();
			}, 1500);
		} catch (error) {
			setNotification(error.message || "Error updating password.");
		}
	};

	return (
		<div className="force-password-modal-overlay">
			<div className="force-password-modal">
				<p className="warning-text">
					⚠️ You are using the default password "string". Please change it!
				</p>

				<p className="localized-text" style={{ color: "red" }}>
					⚠️ Bosanski: Trenutno koristite šifru "string". Molimo vas da je
					promijenite!
				</p>

				<p className="localized-text" style={{ color: "green" }}>
					🇸🇦 أنت تستخدم كلمة المرور الافتراضية "string". يرجى تغيير كلمة المرور
					إلى شيء لا يعرفه إلا أنت.
				</p>

				<TextInput
					label="New Password"
					icon={faLock}
					placeholder="Enter new password"
					type="password"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
				/>

				{notification && <p className="notification">{notification}</p>}

				<div className="modal-footer">
					<SecondaryButton title="Cancel" onClick={onClose} />
					<PrimaryButton
						title="Update Password"
						onClick={handlePasswordChange}
					/>
				</div>
			</div>
		</div>
	);
};

export default ForcePasswordChangeModal;
