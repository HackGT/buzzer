interface ServerConfig {
	port: number;
	secrets: {
		admin: string;
	};
}

const Config: ServerConfig = (() => {
	const env = process.env;

	// Port
	const port = env.PORT? parseInt(env.PORT, 10): 3000;

	// Admin Key: A secret that gives admin access to the service.
	// TODO: add user accounts n' such
	const admin = env.ADMIN_KEY_SECRET || "sample";
	if (!admin) {
		throw new Error("Must have admin key set in `ADMIN_KEY_SECRET`.");
	}

	return {
		port,
		secrets: {
			admin
		}
	};
})();

export default Config;
