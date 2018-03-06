import "mocha";
import { expect } from "chai";

import { Slack } from "../plugins/Slack";

describe("Slack Plugin", () => {

	describe("@here & @channel", () => {

		it("Only includes @here when asked", () => {
			const msg = Slack.processMessage({
				channels: [],
				at_here: true,
				at_channel: false
			}, "hello");
			expect(msg).to.include("<!here>");
			expect(msg).and.to.not.include("<!channel>");
		});

		it("Only includes @channel when asked", () => {
			const msg = Slack.processMessage({
				channels: [],
				at_here: false,
				at_channel: true
			}, "hello");
			expect(msg).to.not.include("<!here>");
			expect(msg).and.to.include("<!channel>");
		});

		it("Includes both when asked", () => {
			const msg = Slack.processMessage({
				channels: [],
				at_here: true,
				at_channel: true
			}, "hello");
			expect(msg).to.include("<!here>");
			expect(msg).and.to.include("<!channel>");
		});

		it("Includes neither when asked", () => {
			const msg = Slack.processMessage({
				channels: [],
				at_here: false,
				at_channel: false
			}, "hello");
			expect(msg).to.not.include("<!here>");
			expect(msg).and.to.not.include("<!channel>");
		});
	});

	describe("config checking", () => {

		it("must contain a channels array", () => {
			expect(() => Slack.instanceOfConfig({})).to.throw();

			expect(() => Slack.instanceOfConfig({
				channels: true
			})).to.throw();

			expect(() => Slack.instanceOfConfig({
				channels: ["hello", true]
			})).to.throw();

			expect(Slack.instanceOfConfig({
				channels: ["hello", "true"]
			})).to.deep.equal({
				channels: ["hello", "true"],
				at_channel: false,
				at_here: false
			});
		});

		it("maintains flag info", () => {
			expect(Slack.instanceOfConfig({
				channels: [""]
			})).to.deep.equal({
				channels: [""],
				at_channel: false,
				at_here: false
			});

			expect(Slack.instanceOfConfig({
				channels: [""],
				at_channel: true
			})).to.deep.equal({
				channels: [""],
				at_channel: true,
				at_here: false
			});

			expect(Slack.instanceOfConfig({
				channels: [""],
				at_here: true
			})).to.deep.equal({
				channels: [""],
				at_channel: false,
				at_here: true
			});

			expect(Slack.instanceOfConfig({
				channels: [""],
				at_here: true,
				at_channel: true
			})).to.deep.equal({
				channels: [""],
				at_channel: true,
				at_here: true
			});
		});
	});
});
