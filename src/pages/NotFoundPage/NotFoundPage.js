import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton/SecondaryButton";
import "./NotFoundPage.css";

const NotFoundPage = () => {
	const navigate = useNavigate();
	const canvasRef = useRef(null);
	const animationRef = useRef(null);

	// Particle animation setup
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);

		// Create particles
		const particleCount = 50;
		const particles = [];

		for (let i = 0; i < particleCount; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				radius: Math.random() * 3 + 1,
				color: "#04abfd",
				speedX: Math.random() * 2 - 1,
				speedY: Math.random() * 2 - 1,
				opacity: Math.random() * 0.5 + 0.1,
			});
		}

		// Connect particles with lines if they're close enough
		const connectParticles = () => {
			const maxDistance = 150;

			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					const dx = particles[i].x - particles[j].x;
					const dy = particles[i].y - particles[j].y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < maxDistance) {
						ctx.beginPath();
						ctx.strokeStyle = `rgba(4, 171, 253, ${
							0.2 * (1 - distance / maxDistance)
						})`;
						ctx.lineWidth = 1;
						ctx.moveTo(particles[i].x, particles[i].y);
						ctx.lineTo(particles[j].x, particles[j].y);
						ctx.stroke();
					}
				}
			}
		};

		// Animation loop
		const animate = () => {
			ctx.clearRect(0, 0, width, height);

			// Update and draw particles
			particles.forEach((particle) => {
				particle.x += particle.speedX;
				particle.y += particle.speedY;

				// Bounce off edges
				if (particle.x < 0 || particle.x > width) {
					particle.speedX = -particle.speedX;
				}

				if (particle.y < 0 || particle.y > height) {
					particle.speedY = -particle.speedY;
				}

				// Draw particle
				ctx.beginPath();
				ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(4, 171, 253, ${particle.opacity})`;
				ctx.fill();
			});

			connectParticles();

			animationRef.current = requestAnimationFrame(animate);
		};

		// Handle window resize
		const handleResize = () => {
			width = canvas.width = window.innerWidth;
			height = canvas.height = window.innerHeight;
		};

		window.addEventListener("resize", handleResize);

		// Start animation
		animate();

		// Cleanup
		return () => {
			window.removeEventListener("resize", handleResize);
			cancelAnimationFrame(animationRef.current);
		};
	}, []);

	const goBack = () => {
		navigate(-1);
	};

	return (
		<div className="not-found-container">
			<canvas ref={canvasRef} className="background-canvas"></canvas>

			<div className="not-found-content">
				<div className="animated-404">
					<div className="digit">4</div>
					<div className="orbit">
						<div className="planet"></div>
					</div>
					<div className="digit">4</div>
				</div>

				<h1 className="not-found-title">Page Not Found</h1>

				<p className="not-found-message">
					The page you are looking for seems to have wandered off into space.
				</p>

				<div className="not-found-actions">
					<SecondaryButton
						onClick={goBack}
						title={
							<>
								<FontAwesomeIcon icon={faArrowLeft} className="button-icon" />
								Go Back
							</>
						}
					/>

					<Link to="/" className="home-link">
						<PrimaryButton
							title={
								<>
									<FontAwesomeIcon icon={faHome} className="button-icon" />
									Home
								</>
							}
						/>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default NotFoundPage;
