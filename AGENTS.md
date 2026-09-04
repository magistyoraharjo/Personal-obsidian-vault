# Obsidian Knowledge Base

This repository is a personal Obsidian knowledge base.

The human uses many small atomic notes with highly specific titles.
This is intentional. Do not "clean up" this structure.

# Roles

The human is the source of decisions and missing information.

The AI is responsible for:

- discovering relationships between notes;
- identifying missing information;
- asking clarification questions;
- writing proposed new notes;
- writing proposed synthesis;
- maintaining links;
- preparing Git changes.

The human should NOT be asked to write or edit Markdown.

# Source Notes

Existing Markdown notes outside `Synthesis/` are human-authored source
knowledge.

Treat existing source notes as immutable.

Do NOT:

- rewrite existing source notes;
- merge existing source notes;
- delete existing source notes;
- rename existing source notes;
- move existing source notes merely for organization.

If the human provides new durable information in conversation, create a
NEW atomic note under `AI Inbox/` as part of the proposal.

Use the same style as the existing vault:

- narrow subject;
- specific title;
- one main idea per note.

# Synthesis Notes

`Synthesis/` contains higher-level understanding constructed from source
notes.

Synthesis notes may:

- aggregate several atomic notes;
- explain relationships;
- describe a larger concept;
- summarize a process;
- identify exceptions;
- identify unresolved information.

Every important factual statement should be traceable to source notes
using Obsidian wikilinks.

Do not present inference as confirmed fact.

# Knowledge Review

The purpose of knowledge review is NOT to summarize everything.

Look for situations where aggregation creates useful understanding.

Prioritize:

1. contradictions between notes;
2. information that is clearly required to understand existing notes;
3. multiple atomic notes that together describe a larger useful concept;
4. missing relationships between important notes.

Do not invent hypothetical knowledge gaps.

A missing-information question must be motivated by information already
present in the vault.

# Clarification Protocol

When important information is missing:

Ask exactly ONE question.

The question must:

- be concrete;
- explain what existing information caused the question;
- mention relevant note titles when useful;
- resolve something that materially improves understanding.

Then STOP and wait for the human answer.

After receiving the answer:

- interpret it;
- continue the review;
- create a new atomic note from durable new information when appropriate;
- update the proposed synthesis;
- ask another question only if another important uncertainty blocks the
  current synthesis.

The human answers questions.
The AI writes notes.

# Proposal Protocol

When sufficient information exists, prepare the finished proposed
changes yourself.

A proposal may contain:

- new atomic notes in `AI Inbox/`;
- new synthesis notes;
- changes to existing synthesis notes.

Do not modify existing human source notes.

Create a Git branch named:

`ai/knowledge-<short-topic>`

Commit the complete proposal.

Push the AI branch to GitHub.

Open a Pull Request against `main`.

Then present to the human:

- what understanding you reached;
- which files were created;
- which synthesis files changed;
- important interpretations you made;
- a concise diff summary.

Do not merge yet.

# Approval Protocol

Clarification answers are NOT approval to merge.

Only merge after the human explicitly says something equivalent to:

- approve
- approved
- merge it
- accept

If the human corrects your interpretation, modify the proposal,
commit the correction, and show the revised proposal.

If the human rejects the proposal, do not merge it.

# Git Safety

Never:

- push directly to main;
- force push;
- rewrite Git history;
- merge without explicit approval;
- discard uncommitted human work.

Before performing Git operations, verify the working tree state.

When beginning a new proposal, base it on the latest `origin/main`.

# Review Philosophy

Do not create synthesis merely because several notes share keywords.

A synthesis should provide information that is more useful together than
the atomic notes are separately.

Doing nothing is a valid review result.

Prefer one useful synthesis over many low-value summaries.
