import React from "react";
import "./SecondaryButton.css";

const SecondaryButton = ({ title, onClick }) => {
	return (
		<button className="secondary-btn" onClick={onClick}>
			{title}
		</button>
	);
};

export default SecondaryButton;
