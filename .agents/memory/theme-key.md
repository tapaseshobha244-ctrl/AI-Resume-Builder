---
name: Theme localStorage key
description: The localStorage key used to persist the user's theme preference.
---

## Rule
Use `rm-theme` as the localStorage key for theme persistence (not `theme`).

**Why:** The old code stored `theme: "dark"` in localStorage. Switching to `rm-theme` resets all users to the new default (light) on next visit, as if no preference was saved.

**How to apply:** Any new code reading/writing theme preference must use the `rm-theme` key to stay consistent with ThemeProvider.
