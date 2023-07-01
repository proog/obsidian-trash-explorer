import { describe, expect, test, vi } from "vitest";
import { basename, dirname } from "./path";

// Pretend that Node's path module isn't available
vi.mock("path", () => {
	return { basename: undefined, dirname: undefined };
});

describe.each([
	".trash/foo",
	".trash/foo.bar/baz",
	".trash/foo.bar/baz/",
	"/.trash/foo.bar/baz.txt",
	"/.trash/.foo.bar/.baz.txt.",
])("Fallback path functions are compatible with Node", async (input) => {
	// Get the actual Node path module
	const nodePath = (await vi.importActual("path")) as typeof import("path");

	test("dirname", () => {
		expect(dirname).not.toBe(nodePath.dirname);
		expect(dirname(input)).toBe(nodePath.dirname(input));
	});

	test("basename", () => {
		expect(basename).not.toBe(nodePath.basename);
		expect(basename(input)).toBe(nodePath.basename(input));
	});
});
