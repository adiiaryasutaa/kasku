'use client'

import { ThemeProvider } from '@/components/theme-provider'
import React from "react";

export function Provider({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			{children}
		</ThemeProvider>
	);
}