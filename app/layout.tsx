import './globals.css'
import React from "react";
import { Provider } from "@/app/provider";

export const metadata = {
	title: 'Kasku',
	description: 'Generated by Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
		<body>
		<Provider>
			{children}
		</Provider>
		</body>
		</html>
	);
}