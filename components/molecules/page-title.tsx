import React from "react";

export default function PageTitle({ children }: { children: React.ReactNode; }) {
	return (
		<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
			{children}
		</h1>
	);
}