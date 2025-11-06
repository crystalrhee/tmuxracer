# Git Push Command

Stages all changes, auto-generates a commit message based on the staged diff, commits, and pushes to `origin main`.

## Steps

1. **Stage all changes:**
   ```bash
   git add -A
   ```

2. **Generate smart commit message from staged changes:**
   - Analyze the diff to understand what changed (additions, deletions, modified files)
   - Create a descriptive message for the commit message

3. **Commit and push:**
   ```bash
   git commit -m "$COMMIT_MSG"
   git push origin main
   ```
