import { upperCamel, lowerSnake } from '../server/common';
// Import * as mocha from "mocha";
// Import { expect } from "chai";

// All graphql requests are formatted lower_snake (readability)
// All internal configs are upper camel (matching filename convention)
// Test the functions that do these conversions
const testUpperCamel = (before: string, after: string) => {
	const actual = upperCamel(before);
	console.log(`Given "${before}", upperCameled to "${actual}".` );
	if (actual !== after) console.log(`ERROR: expected "${after}".`);
	return actual === after;
};

// Converts camel and snake to lower_snake (for plugin)
const testLowerSnake = (before: string, after: string) => {
	const actual = lowerSnake(before);
	console.log(`Given "${before}", upperCameled to "${actual}".` );
	if (actual !== after) console.log(`ERROR: expected "${after}".`);
	return actual === after;
};

function main() {
	console.log("Running tests...");
	// Upper camel has less worry about edge cases since graphql is machine generated
	testUpperCamel("", "");
	testUpperCamel("live", "Live");
	testUpperCamel("LiveSite", "LiveSite");
	testUpperCamel("_live_", "Live"); // This kind of request would be rejected by graphql anyway, as typeDefs generated all accepted fields in proper snake_case formatting
	testUpperCamel("live_site", "LiveSite");
	testUpperCamel("a_b_c_d", "ABCD");
	// Lower snake requires good input in index.ts. More rigorous edge-casing
	testLowerSnake("", "");
	testLowerSnake("LiveSite", "live_site"); // UpperCamel
	testLowerSnake("liveSite", "live_site"); // Camel
	testLowerSnake("live_site", "live_site"); // Already snaked
	testLowerSnake("Live_Site", "live_site"); // Already (upper) snaked
	testLowerSnake("Live", "live");
	testLowerSnake("live", "live");

	console.log("Tests completed.");
}

main();
