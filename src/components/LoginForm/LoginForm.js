import React, { useState } from "react";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import TextInput from "../ui/TextInput/TextInput";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton";
import "./LoginForm.css";

const LoginForm = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [keepLoggedIn, setKeepLoggedIn] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// Email validation using regex
	const isValidEmail = (email) => {
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailPattern.test(email);
	};

	const handleLogin = (e) => {
		e.preventDefault(); // Prevent the default form submission behavior

		// Check if email is valid and password is provided
		if (!isValidEmail(email)) {
			setErrorMessage("Please provide a valid email address.");
			setTimeout(() => {
				setErrorMessage(""); // Clear the error message after 3 seconds
			}, 3000);
			return;
		}

		if (!password) {
			setErrorMessage("Please enter your password.");
			setTimeout(() => {
				setErrorMessage(""); // Clear the error message after 3 seconds
			}, 3000);
			return;
		}

		setErrorMessage(""); // Clear error message if validation passes
		console.log("Logging in:", { email, password, keepLoggedIn });
		// Add login logic here
	};

	const handleCancel = () => {
		setEmail("");
		setPassword("");
		setKeepLoggedIn(false);
		setErrorMessage(""); // Clear the error message on cancel
	};

	return (
		<div className="login-container">
			<img
				src={`${process.env.PUBLIC_URL}/alamel_logo.png`}
				alt="Logo"
				className="logo"
			/>

			{errorMessage && <p className="notification">{errorMessage}</p>}

			<form className="login-form" noValidate onSubmit={handleLogin}>
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

				<div className="checkbox-container">
					<input
						type="checkbox"
						id="keep-logged-in"
						checked={keepLoggedIn}
						onChange={(e) => setKeepLoggedIn(e.target.checked)}
					/>
					<label htmlFor="keep-logged-in">Keep me logged in</label>
				</div>
				<div className="button-group">
					<PrimaryButton title="Login" />
					<SecondaryButton title="Cancel" onClick={handleCancel} />
				</div>
			</form>
		</div>
	);
};

export default LoginForm;
