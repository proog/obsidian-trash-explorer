<script lang="ts">
	import type { Trash, TrashItem } from "../models";
	import { type TrashExplorerViewNode } from "../view";
	import SearchInput from "./SearchInput.svelte";
	import TrashItemView from "./TrashItemView.svelte";

	export let trash: Trash;

	let searchQuery = "";

	$: viewNodes = buildViewNodes(
		trash.items,
		searchQuery.trim().toLocaleUpperCase()
	);

	function buildViewNodes(
		items: TrashItem[],
		filter: string
	): TrashExplorerViewNode[] {
		return items
			.filter((item) => matchesFilter(item, filter))
			.map((item) => ({
				item,
				nodes:
					item.kind === "folder"
						? buildViewNodes(item.children, filter)
						: [],
			}));
	}

	function matchesFilter(item: TrashItem, filter: string): boolean {
		if (!filter || item.path.toLocaleUpperCase().includes(filter)) {
			return true;
		}

		if (item.kind === "folder") {
			return item.children.some((child) => matchesFilter(child, filter));
		}

		return false;
	}
</script>

{#if trash.isEmpty}
	<div class="pane-empty">The trash is empty.</div>
{:else}
	<SearchInput placeholder="Filter by name..." bind:query={searchQuery} />

	<div class="node-list">
		{#each viewNodes as viewNode}
			<TrashItemView {viewNode} on:restore on:delete />
		{:else}
			<div class="pane-empty">Filter matched no files.</div>
		{/each}
	</div>
{/if}

<style>
	.node-list {
		margin-top: 1em;
	}
</style>
