import { App, ItemView, Modal, Notice, Setting, WorkspaceLeaf } from "obsidian";
import { Trash, type TrashItem } from "./models";
import TrashView from "./views/TrashView.svelte";

export type TrashExplorerViewNode = {
	item: TrashItem;
	nodes: TrashExplorerViewNode[];
};

export const VIEW_TYPE = "trash-explorer";

export class TrashExplorerView extends ItemView {
	icon = "trash";
	navigation = false;
	private component: TrashView | undefined;

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
		this.component = new TrashView({
			target: this.contentEl,
			props: { trash: this.trash },
		});

		this.component.$on("restore", async (event) => {
			if (await this.restoreFile(event.detail)) {
				this.refresh();
			}
		});

		this.component.$on("delete", async (event) => {
			if (await this.deleteFile(event.detail)) {
				this.refresh();
			}
		});

		await this.refresh();
	}

	async onClose(): Promise<void> {
		this.component?.$destroy();
	}

	async refresh(): Promise<void> {
		this.component?.$set({ trash: this.trash });
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
