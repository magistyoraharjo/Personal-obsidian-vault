---
description: Build or update a living Wiki page for a topic
agent: knowledge-reviewer
---

Work on this Wiki topic:

$ARGUMENTS

Follow AGENTS.md.

Goal: create or update one coherent Wikipedia-like page under `Wiki/`
representing the current understanding of this subject.

Start read-only.

1. Check whether a Wiki page for this topic already exists.
2. Search the vault for relevant atomic notes using:
   - filenames
   - paths
   - note contents
   - wikilinks
   - related terminology
3. Read the relevant source notes.
4. Build a model of:
   - confirmed facts
   - current plans
   - possibilities
   - historical/superseded information
   - contradictions
   - genuinely important unknowns

Do not modify existing human source notes.

Do not merely concatenate or summarize notes.
The Wiki page should explain the subject coherently as one article.

If a contradiction or missing fact materially affects understanding:

- ask me exactly ONE concrete question;
- explain briefly why you need the answer;
- then STOP and wait for my answer.

After I answer:

- treat durable information I provide as source knowledge;
- prepare an appropriately narrow atomic note under `AI Inbox/`;
- incorporate it into the Wiki article;
- continue reviewing the same topic.

Ask another question only when it materially improves the article.
Do not interview me for completeness.

When the article is coherent enough to be useful:

1. create a branch from the latest `origin/main` named
   `ai/wiki-<short-topic>`;
2. create the necessary AI Inbox notes;
3. create or update the Wiki page;
4. inspect your own diff for unsupported claims;
5. commit the proposal;
6. push the branch;
7. open a GitHub Pull Request against `main`.

Then show me:

- the current understanding of the topic;
- important decisions/facts captured from me;
- files created or changed;
- unresolved information that remains;
- a concise diff summary.

Do not merge until I explicitly approve.
