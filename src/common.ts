// Convert snake_case to CamelCase
export function upperCamel(before: string): string {
  return before
    .split("_")
    .map(w => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join("");
}

// Convert CamelCase to snake_case
export function lowerSnake(before: string): string {
  return before
    .split(/_|(?=[A-Z])/)
    .filter(phrase => phrase.length !== 0)
    .join("_")
    .toLowerCase();
}
