import { App, Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
	constructor(
		app: App,
		private readonly title: string,
		private readonly message: string,
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
					.setButtonText("Delete")
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
