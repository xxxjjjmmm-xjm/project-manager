---
name: gateguard-fact-forcing
description: GateGuard always blocks Write/Edit/Bash first, requiring fact presentation before retry
metadata:
  type: project
---

GateGuard intercepts every Write, Edit, and destructive Bash operation on this project.

## When GateGuard blocks

Always present 4 facts inline, then retry:

1. Which files are affected and what imports/calls them
2. Confirm no existing file via Glob
3. If data: show fields + synthetic sample values
4. Quote user's instruction verbatim

## Pattern that works

```
1) app/projects/page.tsx 2) New. 3) Component, no data. 4) "继续"
> Write — succeeds on retry
```

## Disabling

`ECC_GATEGUARD=off` or add `pre:edit-write:gateguard-fact-force,pre:bash:gateguard-fact-force` to `ECC_DISABLED_HOOKS`.

Currently configured in `.claude/settings.json` `env.ECC_DISABLED_HOOKS`.

**Why:** Each operation costs ~1 extra turn for fact presentation. Always Glob first.
**How to apply:** Glob target dir → present 4 facts → retry operation.
