import { Vault, normalizePath, type ListedFiles, type Stat } from "obsidian";
import { basename, dirname } from "./path";

export const TRASH_ROOT = normalizePath(".trash");

export type TrashItem = TrashedFile | TrashedFolder;

export class Trash {
	private readonly root = new TrashedFolder(
		this.vault,
		TRASH_ROOT,
		null,
		null
	);

	constructor(private readonly vault: Vault) {}

	get items(): TrashItem[] {
		return this.root.children;
	}

	get isEmpty(): boolean {
		return this.root.isEmpty;
	}

	async refresh(): Promise<void> {
		if (await this.vault.adapter.exists(this.root.path)) {
			const trashedFiles = await this.vault.adapter.list(this.root.path);
			this.root.children = await this.buildItems(trashedFiles, this.root);
		} else {
			this.root.children = [];
		}
	}

	async empty(): Promise<void> {
		if (await this.vault.adapter.exists(this.root.path)) {
			await this.root.remove();
		}

		this.root.children = [];
	}

	private async buildItems(
		trashedFiles: ListedFiles,
		parent: TrashedFolder | null
	): Promise<TrashItem[]> {
		const items = [];

		for (const path of trashedFiles.folders.sort(this.compareName)) {
			const files = await this.vault.adapter.list(path);

			const stat = await this.vault.adapter.stat(path);
			const trashedFolder = new TrashedFolder(
				this.vault,
				path,
				stat,
				parent
			);
			items.push(trashedFolder);

			trashedFolder.children = await this.buildItems(
				files,
				trashedFolder
			);
		}

		for (const path of trashedFiles.files.sort(this.compareName)) {
			const stat = await this.vault.adapter.stat(path);
			const trashedFile = new TrashedFile(this.vault, path, stat, parent);
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
	readonly path: string;
	readonly basename: string;
	readonly size: number;

	constructor(
		readonly vault: Vault,
		path: string,
		stat: Stat | null,
		readonly parent: TrashedFolder | null
	) {
		this.path = normalizePath(path);
		this.basename = basename(this.path);
		this.size = stat?.size || 0;
	}

	protected async restore(): Promise<boolean> {
		const restorePath = normalizePath(
			this.path.replace(`${TRASH_ROOT}/`, "")
		);

		if (await this.vault.adapter.exists(restorePath)) {
			return false;
		}

		const restoreParentDir = dirname(restorePath);

		if (!(await this.vault.adapter.exists(restoreParentDir))) {
			await this.vault.adapter.mkdir(restoreParentDir);
		}

		await this.vault.adapter.rename(this.path, restorePath);

		return true;
	}

	abstract remove(): Promise<void>;
}

class TrashedFile extends TrashedBase {
	readonly kind = "file";

	async restore(): Promise<boolean> {
		const restored = await super.restore();

		if (restored) {
			this.parent?.removeChild(this);
		}

		return restored;
	}

	async remove(): Promise<void> {
		await this.vault.adapter.remove(this.path);
		this.parent?.removeChild(this);
	}
}

class TrashedFolder extends TrashedBase {
	readonly kind = "folder";

	children: TrashItem[] = [];

	get isEmpty(): boolean {
		return this.children.length === 0;
	}

	async restore(): Promise<boolean> {
		const restored = await super.restore();

		if (restored) {
			this.parent?.removeChild(this);
		}

		return restored;
	}

	async remove(): Promise<void> {
		await this.vault.adapter.rmdir(this.path, true);
		this.parent?.removeChild(this);
	}

	removeChild(child: TrashItem): void {
		const index = this.children.indexOf(child);

		if (index !== -1) {
			this.children.splice(index, 1);
		}
	}
}
