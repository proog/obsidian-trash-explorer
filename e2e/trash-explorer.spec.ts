import test, { expect, type ElectronApplication } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { _electron as electron } from "playwright";

const appPath = path.resolve("./.obsidian-unpacked/main.js");
const vaultPath = path.resolve("./e2e-vault");

let app: ElectronApplication;

test.beforeEach(async () => {
	// Restore .trash folder from template
	await fs.cp(
		path.join(vaultPath, "Trash template"),
		path.join(vaultPath, ".trash"),
		{ recursive: true, force: true }
	);
	await fs.rm(path.join(vaultPath, "Recipes"), {
		recursive: true,
		force: true,
	});

	app = await electron.launch({
		args: [
			appPath,
			"open",
			`obsidian://open?path=${encodeURIComponent(vaultPath)}`,
		],
	});
});

test.afterEach(async () => {
	await app?.close();
});

test("can open trash explorer view from ribbon", async () => {
	const window = await app.firstWindow();
	const trashExplorerLeaf = window.locator(
		".workspace-leaf-content[data-type=trash-explorer]"
	);

	await window.getByLabel("Files", { exact: true }).click();
	await expect(trashExplorerLeaf).not.toBeVisible();

	await window.getByLabel("Open trash explorer", { exact: true }).click();
	await expect(trashExplorerLeaf).toBeVisible();
});

test("can empty the trash from command palette", async () => {
	const window = await app.firstWindow();
	await window.getByLabel("Open trash explorer", { exact: true }).click();

	await expect(window.locator(".trash-item")).toHaveCount(5);

	// Empty trash through the command palette
	await window.getByLabel("Open command palette", { exact: true }).click();
	await window.locator("input.prompt-input").pressSequentially("empty trash");
	await expect(window.locator(".suggestion-item")).toHaveCount(1);
	await window.locator(".suggestion-item").click();
	await window.locator("button.mod-warning").getByText("Empty trash").click();

	await expect(window.locator(".notice")).toHaveText("Emptied the trash");
	await expect(window.locator(".trash-item")).toHaveCount(0);
});

test("can restore items from trash explorer view", async () => {
	const window = await app.firstWindow();
	const trashExplorerLeaf = window.locator(
		".workspace-leaf-content[data-type=trash-explorer]"
	);

	await window.getByLabel("Open trash explorer", { exact: true }).click();
	await expect(trashExplorerLeaf).toBeVisible();

	const trashItemName = "Recipes";
	const trashItem = trashExplorerLeaf.locator(".trash-item", {
		hasText: trashItemName,
	});
	await expect(trashItem).toContainText("2 files, 0 folders");
	await trashItem.getByLabel("Restore").click();
	await expect(trashItem).not.toBeVisible();

	await window.getByLabel("Files", { exact: true }).click();
	await expect(
		window.locator(
			".workspace-leaf-content[data-type=file-explorer] .nav-folder-title-content",
			{ hasText: trashItemName }
		)
	).toBeVisible();
});

test("can delete items from trash explorer view", async () => {
	const window = await app.firstWindow();
	const trashExplorerLeaf = window.locator(
		".workspace-leaf-content[data-type=trash-explorer]"
	);

	await window.getByLabel("Open trash explorer", { exact: true }).click();
	await expect(trashExplorerLeaf).toBeVisible();

	const trashItemName = "Recipes";
	const trashItem = trashExplorerLeaf.locator(".trash-item", {
		hasText: trashItemName,
	});
	await expect(trashItem).toContainText("2 files, 0 folders");
	await trashItem.getByLabel("Delete permanently").click();

	await window.locator("button.mod-warning").getByText("Delete").click();

	await expect(window.locator(".notice")).toHaveText(
		`Permanently deleted "${trashItemName}"`
	);
	await expect(trashItem).not.toBeVisible();
});
