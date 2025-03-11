import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage = () => {
	const navigate = useNavigate();

	const goBack = () => {
		navigate(-1);
	};

	return (
		<div className="not-found-container">
			<div className="not-found-content">
				<div className="not-found-graphic">
					<div className="digit">4</div>
					<div className="circle"></div>
					<div className="digit">4</div>
				</div>

				<h1>Page Not Found</h1>

				<p className="not-found-message">
					The page you are looking for doesn't exist or has been moved.
				</p>

				<div className="not-found-actions">
					<button className="btn-back" onClick={goBack}>
						<FontAwesomeIcon icon={faArrowLeft} />
						<span>Go Back</span>
					</button>

					<Link to="/" className="btn-home">
						<FontAwesomeIcon icon={faHome} />
						<span>Home</span>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default NotFoundPage;
