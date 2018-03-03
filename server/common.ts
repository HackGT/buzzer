export const PORT = process.env.PORT? parseInt(process.env.PORT, 10): 3000;

// Some utility functions
export const upperCamel = (before: string): string => before.split('_').map(w => w.slice(0,1).toUpperCase() + w.slice(1)).join('');

export const lowerSnake = (before: string): string => before.split(/_|(?=[A-Z])/).filter(phrase => phrase.length !== 0).join('_').toLowerCase();
