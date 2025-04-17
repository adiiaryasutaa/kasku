import React from "react";

export default function PageDescription({ children }: { children: React.ReactNode; }): React.ReactElement {
	return (
		<p className="text-gray-500 dark:text-gray-400 mt-1">
			{children}
		</p>
	);
}