import * as nodePath from "path";

const isNodeAvailable = typeof nodePath?.basename === "function";

/**
 * Wrapper for Node's path.basename with a fallback for mobile devices.
 */
export const basename = isNodeAvailable
	? nodePath.basename
	: (path: string) => path.match(/([^/]+)\/?$/)?.at(1) || path;

/**
 * Wrapper for Node's path.dirname with a fallback for mobile devices.
 */
export const dirname = isNodeAvailable
	? nodePath.dirname
	: (path: string) => path.match(/^(.+)\/.+/)?.at(1) || ".";
