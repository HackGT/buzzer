// Convert snake_case to CamelCase
export function upperCamel(before: string): string {
  // Manually make fcm all uppercase
  if (before === "fcm") {
    return "FCM";
  }

  return before
    .split("_")
    .map(w => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join("");
}

// Flatten nested arrays into one array
export function flatten(arr: any[]): any[] {
  return arr.reduce(
    (flat, toFlatten) => flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten),
    []
  );
}
