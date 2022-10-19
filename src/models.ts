import { ListedFiles, Vault } from "obsidian";
import { basename, dirname } from "path";

export type TrashItem = TrashedFile | TrashedFolder;

export class TrashRoot {
	items: TrashItem[] = [];

	constructor(private readonly vault: Vault) {}

	async refresh(): Promise<void> {
		const trashedFiles = await this.vault.adapter.list(".trash");
		this.items = await this.buildItems(trashedFiles);
	}

	private async buildItems(trashedFiles: ListedFiles): Promise<TrashItem[]> {
		const items = [];

		for (const path of trashedFiles.folders.sort(this.compareName)) {
			const files = await this.vault.adapter.list(path);
			const children = await this.buildItems(files);

			const trashedFolder = new TrashedFolder(this.vault, path, children);
			items.push(trashedFolder);
		}

		for (const path of trashedFiles.files.sort(this.compareName)) {
			const trashedFile = new TrashedFile(this.vault, path);
			items.push(trashedFile);
		}

		return items;
	}

	private readonly collator = new Intl.Collator(undefined, {
		sensitivity: "base",
	});
	private readonly compareName = (a: string, b: string) =>
		this.collator.compare(a, b);
}

abstract class TrashedBase {
	readonly basename = basename(this.path);

	constructor(readonly vault: Vault, readonly path: string) {}

	async restore(): Promise<boolean> {
		const restorePath = this.path.replace(/^.trash\//, "");

		if (await this.vault.adapter.exists(restorePath)) {
			return false;
		}

		const restoreParentDir = dirname(restorePath);
		await this.vault.adapter.mkdir(restoreParentDir);
		await this.vault.adapter.rename(this.path, restorePath);

		return true;
	}

	abstract remove(): Promise<void>;
}

class TrashedFile extends TrashedBase {
	readonly kind = "file";

	async remove(): Promise<void> {
		await this.vault.adapter.remove(this.path);
	}
}

class TrashedFolder extends TrashedBase {
	readonly kind = "folder";

	constructor(vault: Vault, path: string, readonly children: TrashItem[]) {
		super(vault, path);
	}

	async remove(): Promise<void> {
		await this.vault.adapter.rmdir(this.path, true);
	}
}
