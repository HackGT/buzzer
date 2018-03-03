import { upperCamel, lowerSnake } from '../common';
import "mocha";
import { expect } from "chai";

/* All graphql requests are formatted lower_snake (readability)
 * All internal configs are upper camel (matching filename convention)
 * Test the functions that do these conversions
 */

// Upper camel has less worry about edge cases since graphql is machine generated
describe("Upper Camel", () => {
	describe("Snake/Config (Expected) inputs", () => {
		it("Empty string", () => {
			expect(upperCamel("")).to.equal("");
		});
		it("Basic single case", () => {
			expect(upperCamel("live")).to.equal("Live");
		});
		it("Basic double", () => {
			expect(upperCamel("live_site")).to.equal("LiveSite");
		});
		it("Basic complex", () => {
			expect(upperCamel("a_b_c_d")).to.equal("ABCD");
		});
	});
	describe("Edge cases (Unexpected)", () => {
		it("Already Camel", () => {
			expect(upperCamel("LiveSite")).to.equal("LiveSite");
		});
		it("Bizarre snake _live_", () => {
			expect(upperCamel("_live_")).to.equal("Live"); // This kind of request would be rejected by graphql anyway, as typeDefs generated all accepted fields in proper snake_case formatting
		});
	});
});

// Lower snake requires good input in index.ts. More rigorous edge-casing
describe("Lower Snake", () => {
	describe("UpperCamel (Expected) inputs", () => {
		it("Empty string", () => {
			expect(lowerSnake("")).to.equal("");
		});
		it("Basic UpperCamel case", () => {
			expect(lowerSnake("LiveSite")).to.equal("live_site"); // UpperCamel
		});
		it("Camel", () => {
			expect(lowerSnake("liveSite")).to.equal("live_site"); // Camel
		});
		it("Lower", () => {
			expect(lowerSnake("live")).to.equal("live");
		});
	});
	describe("Edge cases (Unexpected)", () => {
		it("Already lower snaked", () => {
			expect(lowerSnake("live_site")).to.equal("live_site"); // Already snaked
		});
		it("Already Upper snaked", () => {
			expect(lowerSnake("Live_Site")).to.equal("live_site"); // Already (upper) snaked
		});
		it("Upper single", () => {
			expect(lowerSnake("Live")).to.equal("live");
		});
	});
});
