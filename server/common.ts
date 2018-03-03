export const PORT = process.env.PORT? parseInt(process.env.PORT, 10): 3000;

// A secret that gives admin access to the service.
// TODO: add user accounts n' such
export const ADMIN_KEY_SECRET: string = (() => {
	if (!process.env.ADMIN_KEY_SECRET) {
		throw new Error("Must have admin key set in `ADMIN_KEY_SECRET`.");
	}
	return process.env.ADMIN_KEY_SECRET;
})();

// Some utility functions
export const upperCamel = (before: string): string => before.split('_').map(w => w.slice(0,1).toUpperCase() + w.slice(1)).join('');

export const lowerSnake = (before: string): string => before.split(/_|(?=[A-Z])/).filter(phrase => phrase.length !== 0).join('_').toLowerCase();
