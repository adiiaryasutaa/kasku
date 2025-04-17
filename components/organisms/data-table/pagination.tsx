import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

interface TablePaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function TablePagination({
																	currentPage,
																	totalPages,
																	onPageChange,
																}: TablePaginationProps) {
	if (totalPages <= 1) return null;

	const getPageNumbers = () => {
		const pages = [];
		if (totalPages <= 5) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);
			if (currentPage > 3) pages.push("ellipsis-1");
			const middle = [currentPage - 1, currentPage, currentPage + 1].filter(
				(p) => p > 1 && p < totalPages
			);
			pages.push(...middle);
			if (currentPage < totalPages - 2) pages.push("ellipsis-2");
			pages.push(totalPages);
		}
		return pages;
	};

	return (
		<div className="p-4 border-t border-gray-200 dark:border-[#1F1F23]">
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={(e) => {
								e.preventDefault();
								if (currentPage > 1) onPageChange(currentPage - 1);
							}}
							className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
						/>
					</PaginationItem>

					{getPageNumbers().map((page, i) =>
						typeof page === "number" ? (
							<PaginationItem key={i}>
								<PaginationLink
									href="#"
									isActive={currentPage === page}
									onClick={(e) => {
										e.preventDefault();
										onPageChange(page);
									}}
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						) : (
							<PaginationItem key={page}>
								<PaginationEllipsis />
							</PaginationItem>
						)
					)}

					<PaginationItem>
						<PaginationNext
							href="#"
							onClick={(e) => {
								e.preventDefault();
								if (currentPage < totalPages) onPageChange(currentPage + 1);
							}}
							className={
								currentPage === totalPages ? "pointer-events-none opacity-50" : ""
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
