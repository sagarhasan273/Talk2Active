import { formatNumberLocale } from "src/locales";

export type InputNumberValue = string | number | null | undefined;

type Options = Intl.NumberFormatOptions | undefined;

const DEFAULT_LOCALE = { code: 'en-US', currency: 'USD' };

function processInput(inputValue: InputNumberValue): number | null {    
    if (inputValue == null || Number.isNaN(inputValue)) {
        return null;
    }
    return Number(inputValue);
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue: InputNumberValue, options?: Options) {
    const locale = formatNumberLocale() || DEFAULT_LOCALE;
  
    const number = processInput(inputValue);
    if (number === null) return '';
  
    const fm = new Intl.NumberFormat(locale.code, {
      notation: 'compact',
      maximumFractionDigits: 2,
      ...options,
    }).format(number);
  
    return fm.replace(/[A-Z]/g, (match) => match.toLowerCase());
}

// ----------------------------------------------------------------------

export function fNumber(inputValue: InputNumberValue, options?: Options) {
    const locale = formatNumberLocale() || DEFAULT_LOCALE;

    const number = processInput(inputValue);
    if (number == null) {
        return '';
    }

    const fm = new Intl.NumberFormat(locale.code, { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options,
    }).format(number);

    return fm;
}

