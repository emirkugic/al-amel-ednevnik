import React, { useState, useContext } from "react";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import TextInput from "../ui/TextInput/TextInput";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton";
import useAuth from "../../hooks/useAuth";
import { ClassLogsContext } from "../../contexts/ClassLogsContext";
import "./LoginForm.css";

const LoginForm = () => {
	const { login } = useAuth();
	const { fetchClassLogs } = useContext(ClassLogsContext);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [keepLoggedIn, setKeepLoggedIn] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e) => {
		e.preventDefault();

		if (!email || !password) {
			setErrorMessage("Please enter both email and password.");
			setTimeout(() => setErrorMessage(""), 3000);
			return;
		}

		setIsLoading(true);
		try {
			const user = await login(email, password);
			await fetchClassLogs(user.token, user.id);
		} catch (error) {
			setErrorMessage("Login failed. Please try again.");
			setTimeout(() => setErrorMessage(""), 3000);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setEmail("");
		setPassword("");
		setKeepLoggedIn(false);
		setErrorMessage("");
	};

	return (
		<div className="login-container">
			{isLoading && <div className="loading-bar"></div>}
			<img
				src={`${process.env.PUBLIC_URL}/alamel_logo.png`}
				alt="Logo"
				className="logo"
			/>
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
				{/* <div className="checkbox-container">
					<input
						type="checkbox"
						id="keep-logged-in"
						checked={keepLoggedIn}
						onChange={(e) => setKeepLoggedIn(e.target.checked)}
					/>
					<label htmlFor="keep-logged-in">Keep me logged in</label>
				</div> */}
				<div className="button-group">
					<PrimaryButton title="Login" disabled={isLoading} />
					<SecondaryButton
						title="Cancel"
						onClick={handleCancel}
						disabled={isLoading}
					/>
				</div>
			</form>
		</div>
	);
};

export default LoginForm;
