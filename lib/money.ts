/** Formats a number as Australian dollars, e.g. money(1234) => "A$1,234". */
export const money = (n: number): string => "A$" + n.toLocaleString("en-AU");
