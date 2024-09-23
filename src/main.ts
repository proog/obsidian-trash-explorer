import { Notice, Plugin } from "obsidian";
import { TRASH_ROOT, Trash } from "./models";
import { ConfirmModal, TrashExplorerView, VIEW_TYPE } from "./view";

export default class TrashExplorerPlugin extends Plugin {
	private trash!: Trash;

	async onload() {
		this.trash = new Trash(this.app.vault);
		await this.trash.refresh();

		this.registerView(
			VIEW_TYPE,
			(leaf) => new TrashExplorerView(leaf, this.trash)
		);

		this.addRibbonIcon("trash", "Open trash explorer", () =>
			this.activateView()
		);

		this.addCommand({
			id: "show-trash-explorer",
			name: "Show trash explorer",
			callback: () => this.activateView(),
		});

		this.addCommand({
			id: "empty-trash",
			name: "Empty trash",
			callback: () => this.emptyTrash(),
		});

		// Refresh trash explorer when a file is deleted
		this.registerEvent(
			this.app.vault.on("delete", async () => {
				await this.trash.refresh();
				await this.refreshOpenLeaves();
			})
		);
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);
	}

	private async activateView() {
		let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];

		// Open a new leaf if it's not already open
		if (!leaf) {
			await this.app.workspace.getLeftLeaf(false)?.setViewState({
				type: VIEW_TYPE,
				active: true,
			});

			leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
		}

		await this.trash.refresh();

		await this.app.workspace.revealLeaf(leaf);
		await (leaf.view as TrashExplorerView).refresh();
	}

	private async refreshOpenLeaves() {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);

		for (const leaf of leaves) {
			if (leaf.view instanceof TrashExplorerView) {
				await leaf.view.refresh();
			}
		}
	}

	private emptyTrash() {
		const title = "Empty trash";
		const message = `Are you sure you want to empty the trash? All files in the "${TRASH_ROOT}" folder will be permanently deleted!`;

		return new Promise<void>((resolve) => {
			const confirmModal = new ConfirmModal(
				this.app,
				title,
				message,
				"Empty trash",
				async () => {
					await this.trash.empty();
					await this.refreshOpenLeaves();

					new Notice(`Emptied the trash`);
					confirmModal.close();
					resolve();
				}
			);

			confirmModal.open();
		});
	}
}
