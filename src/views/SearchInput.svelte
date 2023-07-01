<script lang="ts">
	export let query = "";
	export let placeholder = "";

	function clear() {
		query = "";
	}
</script>

<div class="search-input-container">
	<input
		type="search"
		enterkeyhint="search"
		spellcheck="false"
		{placeholder}
		bind:value={query}
		on:keydown={(e) => e.key === "Escape" && clear()}
	/>
	<div
		class="search-input-clear-button"
		aria-label="Clear search"
		role="button"
		tabindex="-1"
		on:keydown={(e) => e.key === "Enter" && clear()}
		on:click={() => clear()}
	/>
</div>

<style>
	/* These styles are taken from the core Search plugin for a matching appearance */
	.search-input-container {
		flex-grow: 1;
		position: relative;
	}

	.search-input-container:before {
		top: calc((var(--input-height) - var(--search-icon-size)) / 2);
		left: 8px;
		position: absolute;
		content: "";
		height: var(--search-icon-size);
		width: var(--search-icon-size);
		display: block;
		background-color: var(--search-icon-color);
		mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='8'></circle><line x1='21' y1='21' x2='16.65' y2='16.65'></line></svg>");
		-webkit-mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='8'></circle><line x1='21' y1='21' x2='16.65' y2='16.65'></line></svg>");
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
	}

	.search-input-container input {
		padding-right: 56px;
		display: block;
		width: 100%;
		padding-right: 28px;
		padding-left: 36px;
	}

	.search-input-container
		input:placeholder-shown
		~ .search-input-clear-button {
		display: none;
	}

	.search-input-clear-button {
		position: absolute;
		background: transparent;
		border-radius: 50%;
		color: var(--search-clear-button-color);
		cursor: var(--cursor);
		top: 0px;
		right: 2px;
		bottom: 0px;
		line-height: 0;
		height: var(--input-height);
		width: 28px;
		margin: auto;
		padding: 0 0;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: color 0.15s ease-in-out;
	}

	.search-input-clear-button:after {
		content: "";
		height: var(--search-clear-button-size);
		width: var(--search-clear-button-size);
		display: block;
		background-color: currentColor;
		mask-image: url("data:image/svg+xml,<svg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM3.8705 3.09766L6.00003 5.22718L8.12955 3.09766L8.9024 3.8705L6.77287 6.00003L8.9024 8.12955L8.12955 8.9024L6.00003 6.77287L3.8705 8.9024L3.09766 8.12955L5.22718 6.00003L3.09766 3.8705L3.8705 3.09766Z' fill='currentColor'/></svg>");
		-webkit-mask-image: url("data:image/svg+xml,<svg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM3.8705 3.09766L6.00003 5.22718L8.12955 3.09766L8.9024 3.8705L6.77287 6.00003L8.9024 8.12955L8.12955 8.9024L6.00003 6.77287L3.8705 8.9024L3.09766 8.12955L5.22718 6.00003L3.09766 3.8705L3.8705 3.09766Z' fill='currentColor'/></svg>");
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
	}
</style>
