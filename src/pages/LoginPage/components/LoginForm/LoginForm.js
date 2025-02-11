import React, { useState, useContext } from "react";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import TextInput from "../../../../components/ui/TextInput/TextInput";
import PrimaryButton from "../../../../components/ui/PrimaryButton/PrimaryButton";
import SecondaryButton from "../../../../components/ui/SecondaryButton/SecondaryButton";
import useAuth from "../../../../hooks/useAuth";
import { ClassLogsContext } from "../../../../contexts/ClassLogsContext";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";

import ForcePasswordChangeModal from "./ForcePasswordChangeModal";
import { logo } from "../../../../assets/";

const LoginForm = () => {
	const { login } = useAuth();
	const { fetchClassLogs } = useContext(ClassLogsContext);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	// NEW:
	const [showChangeModal, setShowChangeModal] = useState(false);
	const [loggedInUser, setLoggedInUser] = useState(null);

	const handleLogin = async (e) => {
		e.preventDefault();
		console.log("handleLogin called!");

		if (!email || !password) {
			setErrorMessage("Email and password are required.");
			setTimeout(() => setErrorMessage(""), 3000);
			return;
		}

		setIsLoading(true);

		try {
			console.log("Attempting login...");
			const user = await login(email, password);
			console.log("login returned user:", user);

			if (!user || !user.token) {
				throw new Error("No user or token from login!");
			}

			await fetchClassLogs(user.token, user.id);

			console.log(`Password was: "${password}"`);
			if (password === "string") {
				console.log("Detected default password => show modal");
				setLoggedInUser(user);
				setShowChangeModal(true);
			} else {
				console.log("Not default password => proceed to /");
				navigate("/");
			}
		} catch (error) {
			console.log("Login failed", error);
			setErrorMessage("Login failed. Please try again.");
			setTimeout(() => setErrorMessage(""), 3000);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setEmail("");
		setPassword("");
		setErrorMessage("");
	};

	return (
		<div className="login-container">
			{isLoading && <div className="loading-bar"></div>}

			<img src={logo} alt="Logo" className="logo" />
			{errorMessage && <p className="notification">{errorMessage}</p>}

			<form className="login-form" onSubmit={handleLogin}>
				<TextInput
					label="Email"
					icon={faUser}
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="email"
				/>
				<TextInput
					label="Password"
					icon={faLock}
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
				/>

				<div className="button-group">
					<PrimaryButton title="Login" disabled={isLoading} />
					<SecondaryButton
						title="Cancel"
						onClick={handleCancel}
						disabled={isLoading}
					/>
				</div>
			</form>

			{/* Force user to change password if it's "string" */}
			{showChangeModal && (
				<ForcePasswordChangeModal
					onClose={() => setShowChangeModal(false)}
					user={loggedInUser}
				/>
			)}
		</div>
	);
};

export default LoginForm;
