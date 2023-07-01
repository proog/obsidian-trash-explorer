<script lang="ts">
	import type { Trash } from "../models";
	import TrashItemView from "./TrashItemView.svelte";

	export let trash: Trash;
</script>

{#if trash.isEmpty}
	<div class="pane-empty">The trash is empty.</div>
{/if}

{#each trash.items as item}
	<TrashItemView {item} on:restore on:delete />
{/each}
