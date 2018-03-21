import { Source } from "./Plugin";
import { Registration } from "./Registration";

export const sourceAPI: {
	[key: string]: Source;
} = {
	"Registration": new Registration()
};
