import React from "react";
import "./Pagination.css";

const Pagination = ({
	currentPage,
	totalPages,
	handlePageChange,
	indexOfFirstLog,
	indexOfLastLog,
	filteredLogsLength,
}) => {
	return (
		<div className="pagination">
			<div>
				Showing {indexOfFirstLog + 1} to{" "}
				{Math.min(indexOfLastLog, filteredLogsLength)} of {filteredLogsLength}{" "}
				entries
			</div>
			<div className="page-controls">
				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					«
				</button>
				{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
					<button
						key={page}
						onClick={() => handlePageChange(page)}
						className={page === currentPage ? "active" : ""}
					>
						{page}
					</button>
				))}
				<button
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					»
				</button>
			</div>
		</div>
	);
};

export default Pagination;
