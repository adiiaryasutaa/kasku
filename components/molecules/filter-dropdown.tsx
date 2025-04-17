import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Filter, Trash2 } from "lucide-react";

type FilterOption = {
	label: string;
	value: string;
};

type FilterConfig = {
	id: string;
	label: string;
	options: FilterOption[];
	value: string;
	onChange: (value: string) => void;
};

interface DropdownFiltersProps {
	filters: FilterConfig[];
	onClearFilters?: () => void;
}

export const FilterButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({...props}, ref) => {
		return (
			<Button variant="outline" size="sm" ref={ref} {...props}>
				<Filter className="mr-2 h-4 w-4"/>
				Filter
			</Button>
		);
	}
);

FilterButton.displayName = "FilterButton";

const FilterDropdown = ({
	filters,
	onClearFilters,
}: DropdownFiltersProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<FilterButton/>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[220px] space-y-3 p-2">
				{filters.map((filter) => (
					<div key={filter.id}>
						<p className="text-sm font-medium mb-1">{filter.label}</p>
						<Select value={filter.value} onValueChange={filter.onChange}>
							<SelectTrigger>
								<SelectValue placeholder={`Select ${filter.label}`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								{filter.options.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				))}

				{onClearFilters && (
					<div className="pt-2 border-t border-muted">
						<Button
							onClick={onClearFilters}
							variant="ghost"
							size="sm"
							className="w-full justify-start text-red-600 dark:text-red-400"
						>
							<Trash2 className="mr-2 h-4 w-4"/>
							Clear Filters
						</Button>
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export { FilterDropdown };
export type { FilterOption, FilterConfig };
