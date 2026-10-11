# START_HERE.md — your own guide (read this when you feel lost)

## The one idea
Antigravity does **not** reliably remember yesterday. **The repo remembers.** Three files are the project's memory, and the agents keep them up to date:

| File | Answers | You read it when |
|---|---|---|
| `docs/PROGRESS.md` | What's done / pending, task by task | You want the big picture |
| `docs/DEVLOG.md` | What happened each day and why | You forgot why something was decided |
| `docs/STATE.md` | Exactly where we stopped (branch, blockers) | Start of each session |

## Your daily routine (5 minutes of typing)
1. **Open the project** in Antigravity. New conversation.
2. Type **`/next`** → it tells you where you are and the exact command to type.
3. Type the command it gives (usually `/start-task <ID>`). Read the plan. Say **"approved"** or comment on it.
4. Type **`/implement`**. Go do customer work while it runs.
5. Check the result yourself. Switch to the other model → **`/cross-review`**. Fix problems. Merge.
6. Type **`/end-of-day`** → the three files above are updated. Done.

If you only remember two commands: **`/next`** at the start and **`/end-of-day`** at the end.

## If something feels off
| Situation | Do this |
|---|---|
| "I don't remember what we were doing" | `/next` |
| Records and reality disagree | `/next` reports drift; confirm which is right |
| An agent is looping or confused | Stop. New conversation. `/next`. Smaller task |
| You forgot `/end-of-day` yesterday | Run it now in a new conversation; it reads git history |
| Not sure a task is really finished | Check `AGENTS.md` → Definition of Done; only then tick `[x]` |
| Big decision to make | Write it in DEVLOG with the reason |

## What agents can't do (the "Human track" in PROGRESS.md)
Customer interviews, collecting Tally exports, CA review of tax rules, pilots, WhatsApp/payment accounts, legal documents, and the week-12 go/no-go. `/next` reminds you of these.

## Where everything is
- Rules for agents: `AGENTS.md`, `.agent/`
- The plan and task details: `docs/DEVELOPMENT_PLAN.md`
- How to work with Antigravity: `docs/ANTIGRAVITY_PLAYBOOK.md`
- Tax/legal rules (CA-reviewed only): `docs/domain/compliance-rules.md`
- Ideas and bugs found along the way: `docs/BACKLOG.md`

## Weekly (Friday, 45 minutes)
`/weekly-review` → read it → decide the **single** priority for next week → note it in DEVLOG.
