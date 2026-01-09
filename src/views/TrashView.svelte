<script lang="ts">
	import type { Trash, TrashItem } from "../models";
	import type { TrashExplorerViewNode } from "../view";
	import SearchInput from "./SearchInput.svelte";
	import TrashItemView from "./TrashItemView.svelte";

	interface Props {
		trash: Trash;
		restoreItem: (item: TrashItem) => void;
		deleteItem: (item: TrashItem) => void;
	}

	let { trash, restoreItem, deleteItem }: Props = $props();
	let searchQuery = $state("");

	const viewNodes = $derived(
		buildViewNodes(trash.items, searchQuery.trim().toLocaleUpperCase()),
	);

	function buildViewNodes(
		items: TrashItem[],
		filter: string,
	): TrashExplorerViewNode[] {
		const nodes: TrashExplorerViewNode[] = [];

		for (const item of items) {
			const childNodes =
				item.kind === "folder"
					? buildViewNodes(item.children, filter)
					: [];

			if (childNodes.length || matchesFilter(item, filter)) {
				nodes.push({ item, nodes: childNodes });
			}
		}

		return nodes;
	}

	function matchesFilter(item: TrashItem, filter: string): boolean {
		return !filter || item.path.toLocaleUpperCase().includes(filter);
	}
</script>

<div class="container">
	{#if trash.isEmpty}
		<div class="pane-empty">The trash is empty.</div>
	{:else}
		<div>
			<SearchInput
				placeholder="Filter by name..."
				bind:query={searchQuery}
			/>
		</div>

		<div class="node-list">
			{#each viewNodes as viewNode}
				<TrashItemView {viewNode} {restoreItem} {deleteItem} />
			{:else}
				<div class="pane-empty">Filter matched no files.</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.node-list {
		margin-top: 1em;
		overflow-y: auto;
	}
</style>
