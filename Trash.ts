import { ListedFiles, Vault } from "obsidian";
import { TrashItem } from "TrashItem";

export class Trash {
	items: TrashItem[] = [];

	constructor(private readonly vault: Vault) {}

	async refresh(): Promise<void> {
		const trashedFiles = await this.vault.adapter.list(".trash");
		this.items = await this.buildItems(trashedFiles);
	}

	private async buildItems(trashedFiles: ListedFiles): Promise<TrashItem[]> {
		const items = [];

		for (const folderPath of trashedFiles.folders) {
			const item = new TrashItem(this.vault, folderPath, true);
			items.push(item);

			const files = await this.vault.adapter.list(folderPath);
			item.children.push(...(await this.buildItems(files)));
		}

		for (const filePath of trashedFiles.files) {
			const item = new TrashItem(this.vault, filePath, false);
			items.push(item);
		}

		return items;
	}
}
