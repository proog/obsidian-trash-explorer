import { ButtonComponent, ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { Trash } from "Trash";
import { ConfirmModal } from "./ConfirmModal";
import { TrashItem } from "./TrashItem";

export const VIEW_TYPE = "trash-explorer";

export class TrashExplorerView extends ItemView {
	icon = "trash";
	navigation = false;

	constructor(leaf: WorkspaceLeaf, private readonly trash: Trash) {
		super(leaf);
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Trash explorer";
	}

	async onOpen(): Promise<void> {
		await this.refresh();
	}

	async refresh() {
		const container = this.contentEl;
		container.empty();
		this.renderItems(this.trash.items, container);
	}

	private async renderItems(items: TrashItem[], container: Element) {
		for (const item of items) {
			const itemContainer = container.createEl("div");
			this.renderItem(item, itemContainer);

			if (item.isFolder) {
				const nestedContainer = itemContainer.createEl("div");
				nestedContainer.style.paddingLeft = "1em";
				await this.renderItems(item.children, nestedContainer);
			}
		}
	}

	private renderItem(item: TrashItem, container: Element) {
		const el = container.createEl("div", {
			cls: "trash-item",
		});

		el.createEl("div", {
			cls: "trash-item__text",
			text: item.basename,
		});

		const buttons = el.createEl("div", {
			cls: "trash-item__buttons",
		});

		const restoreButton = new ButtonComponent(buttons);
		restoreButton.setIcon("reset");
		restoreButton.setTooltip("Restore");
		restoreButton.onClick(async () => {
			if (await this.restoreFile(item)) {
				container.remove();
			}
		});

		const deleteButton = new ButtonComponent(buttons);
		deleteButton.setIcon("trash");
		deleteButton.setTooltip("Delete permanently");
		deleteButton.setWarning();
		deleteButton.onClick(async () => {
			if (await this.deleteFile(item)) {
				container.remove();
			}
		});

		return el;
	}

	private async restoreFile(item: TrashItem): Promise<boolean> {
		if (await item.restore()) {
			new Notice(`Restored "${item.basename}" from trash`);
			return true;
		}

		new Notice(
			`Unable to restore "${item.basename}": the path already exists`,
			10 * 1000
		);
		return false;
	}

	private async deleteFile(item: TrashItem): Promise<boolean> {
		const title = item.isFolder ? "Delete folder" : "Delete file";
		const message = `Are you sure you want to permanently delete "${item.basename}"?`;

		return new Promise<boolean>((resolve) => {
			const confirmModal = new ConfirmModal(
				this.app,
				title,
				message,
				async () => {
					await item.remove();

					new Notice(`Permanently deleted "${item.basename}"`);
					confirmModal.close();
					resolve(true);
				}
			);

			confirmModal.open();
		});
	}
}
