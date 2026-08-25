export const CURRENCIES = Object.freeze({
  USD: { code: "USD", symbol: "$", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", decimals: 2 },
  USDC: { code: "USDC", symbol: "USDC", decimals: 6 },
  EURC: { code: "EURC", symbol: "EURC", decimals: 6 },
  SOL: { code: "SOL", symbol: "SOL", decimals: 9 },
  SUI: { code: "SUI", symbol: "SUI", decimals: 9 },
} as const);

export type CurrencyCode = keyof typeof CURRENCIES;
