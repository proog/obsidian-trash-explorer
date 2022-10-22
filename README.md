# Obsidian Trash Explorer

A plugin for [Obsidian](https://obsidian.md) that makes it possible to list, restore, and delete files in the _.trash_ folder in your Obsidian vault. This is useful if you're having trouble accessing hidden folders, such as on iOS.

## Usage

> **Important:** this plugin works only with Obsidian's own _.trash_ folder. It does not work with the system trash.
>
> To enable this, open the settings and go to _File & Links_, then set _Deleted files_ to _Move to Obsidian trash_.

Click the trash explorer icon in the ribbon or use _Show trash explorer_ from the command palette. Then you can restore or delete files and folders with the buttons in the trash explorer view. It's also possible to delete all trashed files with the _Empty trash_ command.

Items are restored to a vault location matching their location in the trash. For instance, `.trash/Recipes/Belgian waffles.md` will be restored to `Recipes/Belgian waffles.md`, creating any intermediate folders if they don't exist. If the restore path already exists in the vault, the item will not be restored; you'll have to rename the existing file to something else first.

## Limitations

This plugin is at the mercy of where Obsidian places trashed items, as it has no access to their original location. In particular, Obsidian always moves items to the root of the `.trash` folder, regardless of their parent folder structure, so any parent folders will not be preserved when restoring. For instance, trashing the file `Recipes/Belgian waffles.md` will move it to `.trash/Belgian waffles.md`, and restoring it will move it to `Belgian waffles.md` in the root of the vault.

As of October 2022, the Obsidian mobile app seems to add a dot at the end of folder names when trashing them. This is not related to this plugin.
