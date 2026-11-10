---
name: local-vault-first
description: Use for every Obsidian vault lookup, review, edit, or Git task. Makes the local working tree authoritative and blocks GitHub writes unless explicitly requested.
---

# Local Vault First

## Source Of Current State

- Inspect the local vault before answering or changing anything.
- Treat local files, including uncommitted and untracked files, as the current state.
- Do not assume `origin/main`, another branch, a PR, or an isolated worktree matches the local vault.
- Use remote Git state only for comparison when relevant.
- Never overwrite, revert, or bypass local changes merely to match GitHub.

## Default Workflow

- Read and edit the current local working tree.
- Verify local results against the current local files.
- Keep changes local by default.
- Do not automatically run the proposal protocol's branch, commit, push, or PR steps.

## GitHub Boundary

Perform GitHub write actions only when the human explicitly requests them in the current conversation. This includes:

- pushing branches or commits;
- opening, editing, closing, or merging pull requests;
- creating releases or issues; and
- otherwise changing remote repository state.

Approval of knowledge or a local edit is not permission to push it to GitHub.
