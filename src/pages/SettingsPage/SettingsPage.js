import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser,
	faEnvelope,
	faLock,
	faGlobe,
	faSave,
	faTimes,
	faEye,
	faEyeSlash,
	faCheck,
	faUserCog,
	faShieldAlt,
	faLanguage,
	faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import { useLanguage } from "../../contexts";
import "./SettingsPage.css";

const SettingsPage = () => {
	const { user } = useAuth();
	const { language, changeLanguage, t } = useLanguage();
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("preferences");

	// Form states
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		loginPassword: "",
		gradePassword: "",
		language: language, // Use the current language from context
	});

	// Languages
	const languages = [
		{ code: "en", name: "English" },
		{ code: "bs", name: "Bosnian" },
		{ code: "ar", name: "Arabic" },
	];

	// Initialize form with user data
	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				loginPassword: "",
				gradePassword: "",
				language: language, // Use the current language from context
			});
		}
	}, [user, language]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleLanguageChange = (code) => {
		// Update form data
		setFormData((prev) => ({
			...prev,
			language: code,
		}));

		// Actually change the language in the context
		changeLanguage(code);

		// Show success message
		setShowSuccessMessage(true);
		setTimeout(() => setShowSuccessMessage(false), 3000);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		// Create a copy of the form data
		const dataToSave = { ...formData };

		// Only include passwords if they're non-empty
		if (!dataToSave.loginPassword) {
			delete dataToSave.loginPassword;
		}

		if (!dataToSave.gradePassword) {
			delete dataToSave.gradePassword;
		}

		try {
			// This would be an actual API call in a real implementation
			// await updateUserSettings(dataToSave);

			// For demonstration, simulate API call
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Show success message
			setShowSuccessMessage(true);
			setTimeout(() => setShowSuccessMessage(false), 3000);
		} catch (error) {
			console.error("Error updating settings:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="settings-dashboard-card">
			{/* Header */}
			<div className="settings-header">
				<div className="settings-title">
					<h1>
						<FontAwesomeIcon icon={faUserCog} className="settings-title-icon" />
						{t("accountSettings")}
					</h1>
					<p className="settings-subtitle">{t("manageAccount")}</p>
				</div>
			</div>

			{/* Tab Navigation and Content Area */}
			<div className="settings-main-content">
				<div className="settings-sidebar">
					<button
						className={`settings-nav-item ${
							activeTab === "preferences" ? "settings-active" : ""
						}`}
						onClick={() => setActiveTab("preferences")}
					>
						<FontAwesomeIcon icon={faLanguage} className="settings-nav-icon" />
						<span className="settings-nav-text">{t("preferences")}</span>
					</button>
				</div>

				<div className="settings-content-area">
					<form onSubmit={handleSubmit}>
						{activeTab === "preferences" && (
							<div className="settings-form-section">
								<h3 className="settings-section-title">
									{t("languageRegionalSettings")}
								</h3>
								<div className="settings-language-container">
									<div className="settings-language-options">
										<div
											className={`settings-language-option ${
												formData.language === "en" ? "selected" : ""
											}`}
											onClick={() => handleLanguageChange("en")}
										>
											<div className="settings-flag-container">
												<div className="settings-flag settings-flag-en">
													<svg
														viewBox="0 0 60 30"
														xmlns="http://www.w3.org/2000/svg"
													>
														<clipPath id="s">
															<path d="M0,0 v30 h60 v-30 z" />
														</clipPath>
														<clipPath id="t">
															<path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
														</clipPath>
														<g clipPath="url(#s)">
															<path d="M0,0 v30 h60 v-30 z" fill="#012169" />
															<path
																d="M0,0 L60,30 M60,0 L0,30"
																stroke="#fff"
																strokeWidth="6"
															/>
															<path
																d="M0,0 L60,30 M60,0 L0,30"
																clipPath="url(#t)"
																stroke="#C8102E"
																strokeWidth="4"
															/>
															<path
																d="M30,0 v30 M0,15 h60"
																stroke="#fff"
																strokeWidth="10"
															/>
															<path
																d="M30,0 v30 M0,15 h60"
																stroke="#C8102E"
																strokeWidth="6"
															/>
														</g>
													</svg>
												</div>
											</div>
											<div className="settings-language-details">
												<span className="settings-language-name">English</span>
												<span className="settings-language-info">
													{t("defaultSystemLanguage")}
												</span>
											</div>
											{formData.language === "en" && (
												<div className="settings-language-selected">
													<FontAwesomeIcon icon={faCheck} />
												</div>
											)}
										</div>

										<div
											className={`settings-language-option ${
												formData.language === "bs" ? "selected" : ""
											}`}
											onClick={() => handleLanguageChange("bs")}
										>
											<div className="settings-flag-container">
												<div className="settings-flag settings-flag-bs">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="32"
														height="32"
														viewBox="0 0 32 32"
													>
														<rect
															x="1"
															y="4"
															width="30"
															height="24"
															rx="4"
															ry="4"
															fill="#091c91"
														></rect>
														<rect
															x="1"
															y="4"
															width="30"
															height="24"
															rx="4"
															ry="4"
															fill="#091c91"
														></rect>
														<path
															fill="#f6ce46"
															d="M24 28L8 4 24 4 24 28z"
														></path>
														<path
															d="M5,4c-.542,0-1.058,.11-1.529,.306l.442,.321-.527,1.623,1.381-1.003,1.381,1.003-.527-1.623,.862-.627h-1.482Z"
															fill="#fff"
														></path>
														<path
															fill="#fff"
															d="M8.713 9.377L10.094 8.373 8.387 8.373 7.859 6.75 7.332 8.373 5.625 8.373 7.006 9.377 6.478 11 7.859 9.997 9.24 11 8.713 9.377z"
														></path>
														<path
															fill="#fff"
															d="M11.807 14.127L13.187 13.123 11.481 13.123 10.953 11.5 10.426 13.123 8.719 13.123 10.1 14.127 9.572 15.75 10.953 14.747 12.334 15.75 11.807 14.127z"
														></path>
														<path
															fill="#fff"
															d="M14.9 18.877L16.281 17.873 14.574 17.873 14.047 16.25 13.519 17.873 11.813 17.873 13.193 18.877 12.666 20.5 14.047 19.497 15.428 20.5 14.9 18.877z"
														></path>
														<path
															fill="#fff"
															d="M17.994 23.627L19.375 22.623 17.668 22.623 17.141 21 16.613 22.623 14.906 22.623 16.287 23.627 15.76 25.25 17.141 24.247 18.522 25.25 17.994 23.627z"
														></path>
														<path
															fill="#fff"
															d="M21.606 28L22.469 27.373 20.762 27.373 20.234 25.75 19.707 27.373 18 27.373 18.862 28 21.606 28z"
														></path>
														<path
															d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
															opacity=".15"
														></path>
														<path
															d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
															fill="#fff"
															opacity=".2"
														></path>
													</svg>
												</div>
											</div>
											<div className="settings-language-details">
												<span className="settings-language-name">Bosnian</span>
												<span className="settings-language-info">
													Bosanski jezik
												</span>
											</div>
											{formData.language === "bs" && (
												<div className="settings-language-selected">
													<FontAwesomeIcon icon={faCheck} />
												</div>
											)}
										</div>

										<div
											className={`settings-language-option ${
												formData.language === "ar" ? "selected" : ""
											}`}
											onClick={() => handleLanguageChange("ar")}
										>
											<div className="settings-flag-container">
												<div className="settings-flag settings-flag-ar">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="32"
														height="32"
														viewBox="0 0 32 32"
													>
														<rect
															x="1"
															y="4"
															width="30"
															height="24"
															rx="4"
															ry="4"
															fill="#215230"
														></rect>
														<path
															d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
															opacity=".15"
														></path>
														<path
															d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
															fill="#fff"
															opacity=".2"
														></path>
														<path
															d="M25.47,15.008c.105-.506-.616-3.171-.092-2.76,.071-.184-.288-.624-.39-.863-.362,1.107,.47,3.281,.2,4.749-.205,.431-1.607,.948-1.937,1.134,.74,.218,2.5-.651,2.218-2.26Z"
															fill="#fff"
														></path>
														<path
															d="M10.505,16.004c.189-.342,.23-.711,.203-1.119,.285-.116,.625-.309,.739-.323-.078,.268,.108,.557,.485,.52,.075,2.143,.346,1.695,.235-.061,.244-.113,.285-.331,.376-.424,.529,.867,1.302-.28,.818-.752-.005,.039-.118,.415-.118,.415,0,0,.108,.114,.113,.17-.117,.14-.654,.045-.621-.172,.026-.059,.152-.363-.028-.182-.163,.166-.247,.518-.574,.578,.021-.738-.397-2.077-.198-2.519,.186,.233,.189,.069,.075-.16-.189-.337-.287-.981-.469-.283,.189,.786,.217,2.078,.349,2.962-.361-.07-.248-.325-.244-.489-.049-.033-.698,.313-.968,.396-.032-.274-.072-.521-.089-.724,1.012-.097,.623-1.314,.414-1.883,.025-.034,.297,.197,.133-.076-.251-.317-.358-.681-.477-.079,.157,.294,.301,1.089,.451,1.42-.103,.073-.337,.195-.569,.188,.019-.348-.281-1.172-.047-1.233,.161,.185,.185,.105,.072-.126-.195-.297-.349-1.048-.488-.321,.167,.343,.096,.842,.207,1.609-.632-.338-.133-1.385-.652-1.885-.024,.057-.13,.41-.13,.41,.515,.73-.338,2.343-1.17,1.331-.098-.544,.476-2.27-.336-.957-.16,.529-.555,2.134-1.013,.927-.089-.336,.098-1.28-.115-.503-.119,.293,.045,1.443,.567,1.308,.471-.253,.488-1.453,.854-1.754-.724,1.53,.977,2.599,1.429,.747,.013,.287,.224,.749,.612,.848,.023,.228,.06,.525,.094,.838-.072,.022-.144,.042-.217,.059-.605-1.576-2.019,.892-.179,.401,.024,.072,.04,.143,.042,.207-.852,1.187-3.966,1.185-1.934-.889,.066,.024,.191,.147,.18,.158,.073-.112,.11-.232-.09-.308,.33-.876-.875-.159-.14,.119-.149,.156-.5,.385-.715,.519-.167,.094-.68,.407-.803,.479-.057,.104,.455-.213,.61-.266-1.488,2.836,2.314,2.381,3.326,.88Zm-3.208-.938c.106-.053,.207-.104,.29-.15-1.363,2.364,2.618,1.812,2.664,.131,.069-.021,.138-.044,.208-.068,.024,.255,.041,.505,.042,.723-.365,.429-1.203,.928-1.945,1.131-1.368,.433-1.852-.966-1.259-1.766Z"
															fill="#fff"
														></path>
														<path
															d="M16.342,16.611c.242-.267,1.915-.721,2.199-.864,.025-.071,.148-.321,.156-.373-.557,.05-2.089,.134-2.7,.103,.126-.108,.736-.422,1.182-.554,.042,.074,.073,.148,.079,.212,.032-.033,.056-.142,.048-.253,.293-.093,.443-.124,.508-.142,.041-.053,.114-.268,.125-.425-.359-.659-1.502-.446-.957,.322-.457,.192-1.222,.541-1.44,.856l-.035,.017c-.009,.017-.069,.266-.089,.343-.262-.782-.341-1.798-.795-2.093-.247,.506,.507,1.512,.517,2.056-.142,.33-1.991,1.757-2.309,.939,1.134-.431,2.304-1.185,1.336-2.289-.01-.041,.115,.017,.188,.02,.053-.113-.348-.347-.448-.46-.089-.016-.103,.303-.102,.38,.123,.179,.492,.887,.586,1.102-.139,.177-.837,.553-1.518,.863,.005-.176,.414-.656,.299-.786-.283,.515-.322-.323-.122-.485,.201-.642-.663,.951-.09,.897-.06,.114-.134,.253-.187,.419-.792,.369-2,.72-2.528,.893,.029-.094,.025-.174-.006-.15-.542,.637-.017-.81-.096-.67-.302,.23-.48,1.59,.087,.861,.44-.099,1.918-.203,2.471-.534,.084,1.499,2.627-.297,2.513-1.062,.064,.906,.55,1.539,1.847,1.609,.003-.103-.038-.425-.038-.425-.164-.023-.579-.086-.68-.326Zm-.913-.73c.257,.005,1.655-.032,1.921-.04-.491,.171-1.171,.271-1.14,.96-.403-.091-.624-.464-.781-.92Z"
															fill="#fff"
														></path>
														<path
															d="M12.822,13.817c.459-.246,.482-1.398,.854-1.685-.765,1.473,1.05,2.445,1.404,.667,.322,1.701,2.18,.64,1.302-.691-.241-.549,.228,.023,.066-.334-.251-.316-.358-.681-.477-.079,.16,.291,.317,1.085,.451,1.42-1.359,.72-.927-1.166-1.428-1.825-.024,.057-.13,.41-.13,.41,.838,1.883-1.884,2.344-.998,.137-.447-.722-.639,1.657-1.145,1.614-.411,0-.413-.913-.358-1.107-.292,.019-.146,1.653,.458,1.473Z"
															fill="#fff"
														></path>
														<path
															d="M23.777,14.233c.057,.949,.148,1.852,.117,2.524,.349-.356,.155-1.494,.145-2.223,.438,.519,.919,1.113,1.024,1.678,.013,.036,.069-.11,.06-.338,.048-.4-.665-1.312-1.115-1.788,.058-.461-.361-1.665-.114-1.934,.161,.186,.185,.105,.072-.126-.194-.304-.337-1.009-.476-.298,.17,.367,.134,1.245,.25,2.057-.385-.43-.627-.687-.828-.906,.011-.189-.181-.792,.017-.716,.161,.185,.185,.105,.072-.127-.205-.324-.348-1.024-.491-.286,.133,.193,.073,.417,.129,.814-.3-.442-.684-.627-.168-.578-.212-.149-1.029-.919-.813-.171,.305,.143,.63,.818,1.022,1.192,.063,.847,.258,2.221,.288,3.015-.809,.711-.96,.011-1.425-.246,.002-.225-.005-.444-.005-.573,.11-.505-.579-3.324-.041-2.908-.042-.23-.467-1.414-.568-.555,.225,.773,.255,2.393,.371,3.462,.011,.101,.024,.291,.035,.497-.002,0-.003-.001-.004-.002-.664,.19-.965,2.265-1.701,1.066,1.334-1.002,.41-3.321,.327-4.613,.008-.082,.139,.112,.207,.126,.049-.187-.281-.67-.399-.912-.476,.972,.751,3.11,.284,4.421,.061-.629-.685-1.392-1.221-1.883,.048-.267-.519-2.128-.024-1.609,.045-.023-.005-.16-.067-.282-.198-.331-.312-.975-.476-.273,.137,.173,.197,1.62,.287,1.904-.317-.37-1.855-1.462-1.123-1.362-.006-.02-.038-.068-.119-.117-.276-.09-.873-.788-.694-.054,.038,.003,.106,.049,.155,.107,.379,.518,1.263,1.37,1.843,1.886,.221,2.776,.599,3.546,.278,.267,.461,.469,.995,.976,1.103,1.565-.097,.201-.238,.38-.445,.525-.058-.379,.005-.686-.05-.715-.115,.07-.081,.556-.059,.79-1.629,.876-1.893,1.088,.063,.311,.679,1.706,1.129-.408,1.804-.783,.018,.016,.033,.025,.051,.04,.007,.215,.008,.399-.001,.459,.09-.001,.139-.14,.165-.33,1.967,1.537,1.697-1.371,1.455-2.888,.33,.384,.542,.608,.806,.888Z"
															fill="#fff"
														></path>
														<path
															d="M22.159,20.66h0s-1.5,0-1.5,0c.115-.083,.176-.205,.159-.327-.01-.077-.087-.135-.181-.143h-.047c-.114,.011-.196,.093-.184,.183l.005,.035,.006,.053c.006,.067,0,.134-.019,.199H9.313c.165,.24,.465,.386,.789,.386l10.116-.006c-.116,.083-.176,.205-.16,.328,.012,.09,.114,.154,.227,.143,.114-.011,.196-.093,.184-.183l-.005-.035-.006-.053c-.006-.067,0-.134,.019-.2h1.248s.035,.058,.035,.058c.031,.053,.071,.1,.117,.142l.064,.053h0c.126,.088,.287,.14,.456,.14,.16,0,.289-.111,.289-.248v-.072c0-.25-.237-.453-.529-.453Z"
															fill="#fff"
														></path>
													</svg>
												</div>
											</div>
											<div className="settings-language-details">
												<span className="settings-language-name">Arabic</span>
												<span className="settings-language-info">
													اللغة العربية
												</span>
											</div>
											{formData.language === "ar" && (
												<div className="settings-language-selected">
													<FontAwesomeIcon icon={faCheck} />
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						)}
					</form>
				</div>
			</div>

			{/* Success message */}
			{showSuccessMessage && (
				<div className="settings-success-message">
					<FontAwesomeIcon icon={faCheckCircle} /> {t("languageChangedSuccess")}
				</div>
			)}
		</div>
	);
};

export default SettingsPage;
