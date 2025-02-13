// services/classLogService.js
import classLogApi from "../../api/classLogApi";

/**
 * Create a new Class Log via the API.
 *
 * @param {Object} classLogData - Prepared data for creating the class log.
 * @param {string} userToken - The current user's JWT token.
 *
 * @returns {Object} The newly created class log object.
 */
export async function createClassLog(classLogData, userToken) {
	return await classLogApi.createClassLogWithAbsences(classLogData, userToken);
}
