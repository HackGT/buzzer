import dotenv from "dotenv";

dotenv.config();
interface ServerConfig {
  port: number;
  secrets: {
    admin: string | undefined;
  };
}

const Config: ServerConfig = (() => {
  const { env } = process;

  // Port
  const port = env.PORT ? parseInt(env.PORT, 10) : 8080;

  // Admin Key: A secret that gives admin access to the service.
  // TODO: add user accounts n' such
  const admin = env.ADMIN_KEY_SECRET;
  if (env.DEV_MODE) {
    // Admin = Buffer.from("DEV_SECRET","base64").toString();
  }
  if (!admin && !env.DEV_MODE) {
    throw new Error("Must have admin key set in `ADMIN_KEY_SECRET`.");
  }

  return {
    port,
    secrets: {
      admin,
    },
  };
})();

export default Config;
