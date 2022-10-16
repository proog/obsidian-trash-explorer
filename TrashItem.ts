import { Vault } from "obsidian";
import * as path from "path";

export class TrashItem {
	readonly basename = path.basename(this.filePath);
	readonly children: TrashItem[] = [];

	constructor(
		readonly vault: Vault,
		readonly filePath: string,
		readonly isFolder: boolean
	) {}

	async restore(): Promise<boolean> {
		const restorePath = this.filePath.replace(/^.trash\//, "");

		if (await this.vault.adapter.exists(restorePath)) {
			return false;
		}

		const restoreParentDir = path.dirname(restorePath);
		await this.vault.adapter.mkdir(restoreParentDir);
		await this.vault.adapter.rename(this.filePath, restorePath);

		return true;
	}

	async remove(): Promise<void> {
		if (this.isFolder) {
			await this.vault.adapter.rmdir(this.filePath, true);
		} else {
			await this.vault.adapter.remove(this.filePath);
		}
	}
}
