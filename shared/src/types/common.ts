export type ISODateString = string;
export type DateTime = ISODateString | Date;
export type Nullable<T> = T | null;
export type DecimalValue = number | string | { toString(): string };
export type DecimalInput = number | string;
