import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import React from "react";

type SortDirection = "asc" | "desc";

interface Column<T> {
	key: keyof T;
	label: string;
	sortable?: boolean;
	render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
	data: T[];
	columns: Column<T>[];
	sortField: string;
	sortDirection: SortDirection;
	onSort: (field: string) => void;
}

function DataTable<T extends { id: any }>({
	data,
	columns,
	sortField,
	sortDirection,
	onSort,
}: DataTableProps<T>) {
	const getSortIcon = (field: string) => {
		if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4" />;
		return sortDirection === "asc" ? (
			<ArrowUp className="ml-1 h-4 w-4" />
		) : (
			<ArrowDown className="ml-1 h-4 w-4" />
		);
	};

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						{columns.map((col) => (
							<TableHead key={String(col.key)}>
								{col.sortable ? (
									<button
										className="flex items-center font-medium"
										onClick={() => onSort(String(col.key))}
									>
										{col.label}
										{getSortIcon(String(col.key))}
									</button>
								) : (
									col.label
								)}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((item) => (
						<TableRow key={item.id}>
							{columns.map((col) => (
								<TableCell key={String(col.key)}>
									{col.render ? col.render(item) : (item[col.key] as React.ReactNode)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export { DataTable };
export type { Column };
