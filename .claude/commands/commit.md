---
description: Create a git commit without the Claude co-author trailer
---

Create a new git commit for the currently staged (and reasonable unstaged) changes.

Follow these steps:

1. Run these in parallel via the Bash tool:
   - `git status` (no `-uall`)
   - `git diff` (staged + unstaged)
   - `git log -n 10 --oneline` to match the repo's commit message style
2. Analyze the changes and draft a concise commit message:
   - 1–2 sentences, focused on the "why" not the "what"
   - Match the existing style from `git log`
   - Use `add` for new features, `update` for enhancements, `fix` for bug fixes, etc.
   - Do NOT stage files that look like secrets (`.env`, credentials, keys). Warn the user if any are present.
3. Stage only the relevant files by name (avoid `git add -A` / `git add .`).
4. Create the commit using a HEREDOC. **Do NOT include any `Co-Authored-By: Claude …` trailer.** Do NOT include a "Generated with Claude Code" line. The commit message must contain only the human-authored message body.

   Example:
   ```
   git commit -m "$(cat <<'EOF'
   <commit message here>
   EOF
   )"
   ```

5. Run `git status` after the commit to verify it landed.

Rules:
- Never amend an existing commit unless the user explicitly asks.
- Never use `--no-verify` or skip hooks.
- If a pre-commit hook fails, fix the underlying issue and create a NEW commit (do not amend).
- Do not push.
