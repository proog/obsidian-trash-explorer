<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { formatItemStats } from "../formatting";
	import type { TrashItem } from "../models";
	import type { TrashExplorerViewNode } from "../view";

	export let viewNode: TrashExplorerViewNode;

	$: item = viewNode.item;
	$: itemStats = formatItemStats(item);

	const dispatch = createEventDispatcher<{
		restore: TrashItem;
		delete: TrashItem;
	}>();
</script>

<div class="trash-item">
	<div class="textcontainer">
		<div class="name" aria-label={item.basename}>{item.basename}</div>
		<div class="info">{itemStats}</div>
	</div>
	<div class="buttons">
		<button aria-label="Restore" on:click={() => dispatch("restore", item)}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="svg-icon lucide-rotate-ccw"
			>
				<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
				<path d="M3 3v5h5" />
			</svg>
		</button>
		<button
			aria-label="Delete permanently"
			class="mod-warning"
			on:click={() => dispatch("delete", item)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="svg-icon lucide-trash-2"
			>
				<path d="M3 6h18" />
				<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
				<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
				<line x1="10" x2="10" y1="11" y2="17" />
				<line x1="14" x2="14" y1="11" y2="17" />
			</svg>
		</button>
	</div>
</div>

{#if viewNode.nodes.length}
	<div style="padding-left: 1em;">
		{#each viewNode.nodes as childNode}
			<svelte:self viewNode={childNode} on:restore on:delete />
		{/each}
	</div>
{/if}

<style>
	.trash-item {
		margin-bottom: var(--size-2-1);
		border-radius: var(--radius-s);
		cursor: var(--cursor);
		color: var(--nav-item-color);
		font-size: var(--nav-item-size);
		font-weight: var(--nav-item-weight);
		line-height: var(--line-height-tight);
		padding: var(--nav-item-padding);
		padding-left: 0;
		padding-right: 0;
		display: flex;
		align-items: center;
	}

	.textcontainer {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.info {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text-faint);
		font-size: var(--font-ui-small);
	}

	.buttons {
		margin-left: auto;
		display: flex;
		gap: 3px;
		padding-left: 3px;
	}
</style>
