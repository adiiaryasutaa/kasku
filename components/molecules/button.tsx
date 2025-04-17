import { Button } from "@/components/ui/button";
import { Download, Filter, Plus } from "lucide-react";
import React from "react";

const CreateButton = ({ action, label = "New" }: { action: () => void, label?: string }): React.ReactNode => {
	return (
		<Button onClick={action} size="sm" className="h-9">
			<Plus className="mr-2 h-4 w-4" />
			{label}
		</Button>
	);
}

const ExportButton = ({ action, label = "Export" }: { action: () => void, label?: string }): React.ReactNode => {
	return (
		<Button onClick={action} variant="outline" size="sm" className="h-9">
			<Download className="mr-2 h-4 w-4" />
			{label}
		</Button>
	);
}

const FilterButton = (): React.ReactNode => {
	return (
		<Button variant="outline" size="sm" className="h-9">
			<Filter className="mr-2 h-4 w-4" />
			Filter
		</Button>
	);
}

export { CreateButton, ExportButton, FilterButton };