import * as nodePath from "path";

/**
 * Wrapper for Node's path.basename with a fallback for mobile devices.
 */
export function basename(path: string) {
	if (typeof nodePath?.basename === "function") {
		return nodePath.basename(path);
	}

	return path.match(/([^/]+)\/?$/)?.at(1) || path;
}

/**
 * Wrapper for Node's path.dirname with a fallback for mobile devices.
 */
export function dirname(path: string) {
	if (typeof nodePath?.dirname === "function") {
		return nodePath.dirname(path);
	}

	return path.match(/^(.+)\/.+/)?.at(1) || ".";
}
