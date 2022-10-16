import { Plugin } from "obsidian";
import { Trash } from "Trash";
import { TrashExplorerView, VIEW_TYPE } from "./TrashExplorerView";

export default class TrashExplorerPlugin extends Plugin {
	private trash: Trash;

	async onload() {
		this.trash = new Trash(this.app.vault);
		await this.trash.refresh();

		this.registerView(
			VIEW_TYPE,
			(leaf) => new TrashExplorerView(leaf, this.trash)
		);

		this.addRibbonIcon("trash", "Open trash explorer", async () => {
			this.activateView();
		});

		// Refresh trash explorer when a file is deleted
		this.registerEvent(
			this.app.vault.on("delete", async () => {
				await this.trash.refresh();

				const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);

				for (const leaf of leaves) {
					if (leaf.view instanceof TrashExplorerView) {
						await leaf.view.refresh();
					}
				}
			})
		);
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);
	}

	private async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);

		await this.app.workspace.getLeftLeaf(false).setViewState({
			type: VIEW_TYPE,
			active: true,
		});

		const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
		await this.trash.refresh();
		await (leaf.view as TrashExplorerView).refresh();

		this.app.workspace.revealLeaf(leaf);
	}
}