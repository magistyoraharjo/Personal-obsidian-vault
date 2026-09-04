---
description: Capture durable information into the knowledge base
agent: knowledge-reviewer
---

Capture this information as durable knowledge:

$ARGUMENTS

Follow AGENTS.md.

First search the vault to determine whether this information already
exists.

If it already exists with the same meaning, do not create a duplicate.
Tell me where it is recorded.

Otherwise:

1. determine the narrowest useful atomic fact or facts contained in what
   I told you;
2. prepare appropriately titled atomic notes under `AI Inbox/`;
3. determine whether an existing Wiki page is directly affected;
4. if so, update that Wiki page so its current understanding incorporates
   the new information;
5. preserve distinctions between confirmed, planned, possible, historical,
   and unresolved information.

Do not modify existing human source notes.

Do not manufacture additional facts from what I said.

If one critical ambiguity prevents you from recording the information
correctly, ask exactly ONE question and stop.

If the current session already has an active relevant `ai/wiki-*`
proposal, add the change to that proposal rather than creating a separate
branch.

Otherwise prepare a new Git proposal:

- branch from latest `origin/main`;
- create the AI Inbox note(s);
- update the relevant Wiki page if appropriate;
- inspect the diff;
- commit;
- push;
- open a Pull Request.

Show me the interpretation you recorded.

Do not merge until I explicitly approve.
