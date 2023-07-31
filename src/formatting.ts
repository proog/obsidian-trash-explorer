import type { TrashItem } from "./models";

const units = [
	{ size: 0, name: "B", digits: 0 },
	{ size: 1024, name: "KB", digits: 1 },
	{ size: 1024 * 1024, name: "MB", digits: 1 },
	{ size: 1024 * 1024 * 1024, name: "GB", digits: 1 },
];

export function formatItemStats(item: TrashItem): string {
	if (item.kind === "folder") {
		const fileCount = item.children.reduce(
			(count, child) => (child.kind === "file" ? count + 1 : count),
			0
		);
		const folderCount = item.children.length - fileCount;
		const fileWord = fileCount === 1 ? "file" : "files";
		const folderWord = folderCount === 1 ? "folder" : "folders";

		return `${fileCount} ${fileWord}, ${folderCount} ${folderWord}`;
	}

	const bestUnit = units.reduce((best, unit) =>
		item.size >= unit.size ? unit : best
	);

	const displaySize = item.size / (bestUnit.size || 1);
	return `${displaySize.toFixed(bestUnit.digits)} ${bestUnit.name}`;
}
