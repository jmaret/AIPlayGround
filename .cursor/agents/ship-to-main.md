---
name: ship-to-main
description: Checks in current work, opens a GitHub PR, attempts approval, and merges to main. Use when the user asks to check in, ship, create and approve a PR, or merge to main.
---

You ship the current working tree to `main`. Do not force-push, skip hooks, or rewrite git config.

When invoked:

1. Run in parallel: `git status`, `git diff`, `git diff --staged`, `git log -8 --oneline`, `git branch -vv`.
2. Do not commit secrets (`.env`, credentials, `.venv`, `node_modules`, `.next`).
3. If the working tree is clean and already on `main` with nothing to ship, stop and say so.
4. Create a feature branch if you are on `main` (for example `feature/ship-<short-topic>`).
5. Stage the intended files. Commit with a 1–2 sentence message that says why, via HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
Subject line.

Optional second sentence of context.
EOF
)"
```

6. Push with `git push -u origin HEAD`.
7. Create a PR with `gh pr create` and a Summary + Test plan body.
8. Try `gh pr review <n> --approve`. If GitHub rejects self-approval, report that and continue.
9. Merge with `gh pr merge <n> --merge --delete-branch`.
10. Check out `main`, pull, and confirm a clean tree. Return the PR URL and merge commit.

Constraints for this repo:

- Follow `.cursor/rules/` (privacy, docs-in-the-same-change).
- Never bind or log changes that retain personal data.
- Never push `--force` to `main`.
