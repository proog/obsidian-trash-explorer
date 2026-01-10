import eslint from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	svelte.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				parser: "@typescript-eslint/parser",
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: [".svelte"],
			},
		},
	},
	{
		files: ["**/*.mjs"],
		extends: [tseslint.configs.disableTypeChecked],
	},
	globalIgnores([
		".obsidian-unpacked",
		"e2e-vault",
		"main.js",
		"test-results",
	])
);
