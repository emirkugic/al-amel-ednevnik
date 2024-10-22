import React, { useState } from "react";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import TextInput from "../ui/TextInput/TextInput";
import PrimaryButton from "../ui/PrimaryButton/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton/SecondaryButton";
import "./LoginForm.css";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [keepLoggedIn, setKeepLoggedIn] = useState(false);

	const handleLogin = () => {
		console.log("Logging in:", { username, password, keepLoggedIn });
		// Add login logic here
	};

	const handleCancel = () => {
		setUsername("");
		setPassword("");
		setKeepLoggedIn(false);
	};

	return (
		<div className="login-container">
			{/* Add the logo image here */}
			<img
				src={`${process.env.PUBLIC_URL}/alamel_logo.png`}
				alt="Logo"
				className="logo"
			/>

			{/* <h2 className="login-title">Login</h2> */}
			<form className="login-form">
				<TextInput
					label="Username"
					icon={faUser}
					placeholder="Enter your username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					type="text" // Regular text input
				/>
				<TextInput
					label="Password"
					icon={faLock}
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password" // Password input with eye icon
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
					<PrimaryButton title="Login" onClick={handleLogin} />
					<SecondaryButton title="Cancel" onClick={handleCancel} />
				</div>
			</form>
		</div>
	);
};

export default LoginForm;
