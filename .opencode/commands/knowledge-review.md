---
description: Find the highest-value knowledge topic to consolidate or update
agent: knowledge-reviewer
---

Perform a general knowledge review following AGENTS.md.

Start read-only.

Survey:

1. existing files under `Wiki/`;
2. atomic-note filenames and paths;
3. relationships suggested by wikilinks;
4. relevant recent changes where useful.

Do not blindly read every note.

Find the SINGLE highest-value opportunity among:

1. an existing Wiki page that is materially outdated;
2. a contradiction affecting an important existing topic;
3. important atomic knowledge missing from an existing Wiki page;
4. a persistent subject represented by many atomic notes but lacking a
   useful Wiki page.

Work on ONE topic only.

Doing nothing is valid if no sufficiently useful opportunity exists.

Once a topic is selected, use the same process as `/wiki`:

- investigate relevant source notes;
- construct the current understanding;
- ask exactly ONE grounded clarification question if necessary;
- wait for my answer;
- capture durable answers under `AI Inbox/`;
- continue until the Wiki article is coherent enough;
- prepare the finished Git proposal;
- push an `ai/wiki-*` branch;
- open a Pull Request;
- wait for explicit approval before merging.

Do not modify existing human source notes.
