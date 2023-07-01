import type { TrashItem } from "./models";

const units = [
	{ size: 0, name: "B", digits: 0 },
	{ size: 1024, name: "KB", digits: 1 },
	{ size: 1024 * 1024, name: "MB", digits: 1 },
	{ size: 1024 * 1024 * 1024, name: "GB", digits: 1 },
];

export function formatItemStats(item: TrashItem): string {
	if (item.kind === "folder") {
		return `${item.children.length} items`;
	}

	const bestUnit = units.reduce((best, unit) =>
		item.size >= unit.size ? unit : best
	);

	const displaySize = item.size / (bestUnit.size || 1);
	return `${displaySize.toFixed(bestUnit.digits)} ${bestUnit.name}`;
}
