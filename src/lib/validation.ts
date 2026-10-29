/**
 * Shared validation rules and regex definitions derived from input placeholders.
 * Safe for import in both client-side and server-side code (zero runtime I/O dependencies).
 */

/**
 * Electronic ISBN (e-ISBN):
 * Placeholder: "e.g. 978-1-5386-xxxx-x"
 * Format: 13-digit ISBN with 4 hyphens separating 5 groups, starting with prefix 978-.
 * Total length is exactly 17 characters.
 */
export const ISBN_REGEX = /^(?=.{17}$)978-\d{1,5}-\d{1,7}-[\dA-Za-z]{1,7}-[\dA-Za-z]$/;
export const ISBN_PATTERN = "(?=.{17}$)978-\\d{1,5}-\\d{1,7}-[\\dA-Za-z]{1,7}-[\\dA-Za-z]";
export const ISBN_ERROR_MESSAGE = "Electronic ISBN must match the format: e.g. 978-1-5386-xxxx-x";

/**
 * DOI (Digital Object Identifier):
 * Placeholder: "e.g. 10.1109/XXXX.2026"
 * Format: Starts with "10.", followed by 4-9 digit registrant code, a slash, and the suffix.
 */
export const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;
export const DOI_PATTERN = "10\\.\\d{4,9}/[-._;()/:A-Za-z0-9]+";
export const DOI_ERROR_MESSAGE = "DOI must match the format: e.g. 10.1109/XXXX.2026";

/** Validates Electronic ISBN (allows empty string for optional fields). */
export function isValidISBN(val?: string | null): boolean {
  if (!val || !val.trim()) return true;
  return ISBN_REGEX.test(val.trim());
}

/** Validates DOI (allows empty string for optional fields). */
export function isValidDOI(val?: string | null): boolean {
  if (!val || !val.trim()) return true;
  return DOI_REGEX.test(val.trim());
}

