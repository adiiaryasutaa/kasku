export interface Currency {
	value: string;
	label: string;
	symbol: string;
}

export const currencies: Record<string, Currency> = {
	"USD": { value: "USD", label: "USD - US Dollar", symbol: "$" },
	"EUR": { value: "EUR", label: "EUR - Euro", symbol: "€" },
	"GBP": { value: "GBP", label: "GBP - British Pound", symbol: "£" },
	"JPY": { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" },
	"IDR": { value: "IDR", label: "IDR - Indonesian Rupiah", symbol: "Rp" },
};