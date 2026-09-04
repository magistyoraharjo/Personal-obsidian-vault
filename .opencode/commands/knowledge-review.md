---
description: Review the Obsidian knowledge base and improve its higher-level understanding
agent: knowledge-reviewer
---

Begin a knowledge review.

First verify Git status and fetch the latest origin/main.

Do not modify anything yet.

Survey the vault primarily through:

- Markdown filenames and paths;
- Obsidian wikilinks;
- existing files under Synthesis/;
- Git history and recent changes where useful.

Ignore:

- .git/
- .obsidian/
- .opencode/

Identify the single highest-value area where the current atomic notes
could produce better higher-level understanding.

Investigate that area by reading the relevant source notes.

Then choose one of these outcomes:

A. NOTHING

There is currently no sufficiently valuable change to propose.
Explain briefly and make no edits.

B. CLARIFICATION REQUIRED

Existing notes expose an important missing fact or contradiction.

Ask exactly ONE concrete question.

Do not edit files yet.
Wait for my answer and continue this same review afterward.

C. PROPOSAL READY

The existing evidence is sufficient.

Create a fresh branch from origin/main named:

ai/knowledge-<short-topic>

Write the complete proposed changes.

Existing human source notes are immutable.

You may:

- create atomic notes under AI Inbox/ when they represent information
  explicitly supplied by me;
- create new Synthesis/ notes;
- edit existing Synthesis/ notes.

Review your own diff before committing.

Commit the proposal.

Push the AI branch.

Create a GitHub Pull Request against main.

Then show me:

1. what you concluded;
2. what files changed;
3. what new knowledge was created from my answers;
4. important assumptions or interpretations;
5. a concise diff summary.

Do not merge until I explicitly approve the proposal.
