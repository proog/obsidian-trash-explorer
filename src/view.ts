import {
	App,
	ButtonComponent,
	ItemView,
	Modal,
	Notice,
	Setting,
	WorkspaceLeaf,
} from "obsidian";
import { Trash, TrashItem } from "./models";

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

	async refresh(): Promise<void> {
		const container = this.contentEl;
		container.empty();

		if (this.trash.isEmpty) {
			this.renderEmptyMessage(container);
		}

		this.renderItems(this.trash.items, container);
	}

	private renderEmptyMessage(container: HTMLElement): void {
		container.createEl("div", {
			cls: "pane-empty",
			text: "The trash is empty.",
		});
	}

	private renderItems(items: TrashItem[], container: Element): void {
		for (const item of items) {
			const itemContainer = container.createEl("div");
			this.renderItem(item, itemContainer);

			if (item.kind === "folder") {
				const nestedContainer = itemContainer.createEl("div");
				nestedContainer.style.paddingLeft = "1em";
				this.renderItems(item.children, nestedContainer);
			}
		}
	}

	private renderItem(item: TrashItem, container: Element): void {
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
				this.refresh();
			}
		});

		const deleteButton = new ButtonComponent(buttons);
		deleteButton.setIcon("trash");
		deleteButton.setTooltip("Delete permanently");
		deleteButton.setWarning();
		deleteButton.onClick(async () => {
			if (await this.deleteFile(item)) {
				this.refresh();
			}
		});
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
		const title = item.kind === "folder" ? "Delete folder" : "Delete file";
		const message = `Are you sure you want to permanently delete "${item.basename}"?`;

		return new Promise<boolean>((resolve) => {
			const confirmModal = new ConfirmModal(
				this.app,
				title,
				message,
				"Delete",
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

export class ConfirmModal extends Modal {
	constructor(
		app: App,
		private readonly title: string,
		private readonly message: string,
		private readonly submitText: string,
		private readonly onSubmit: () => void
	) {
		super(app);
	}

	onOpen(): void {
		this.titleEl.setText(this.title);

		this.contentEl.createEl("p", {
			text: this.message,
		});

		new Setting(this.contentEl)
			.addButton((button) =>
				button
					.setButtonText(this.submitText)
					.setWarning()
					.onClick(() => {
						this.onSubmit();
						this.close();
					})
			)
			.addButton((button) =>
				button.setButtonText("Cancel").onClick(() => {
					this.close();
				})
			);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
