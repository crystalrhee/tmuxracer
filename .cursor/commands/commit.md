# Commit (Git)

Stages all changes, auto-generates a commit message based on the staged diff, and commits.

## Steps

1. **Stage all changes:**
   ```bash
   git add -A
   ```

2. **Generate smart commit message from staged changes:**
   - Analyze the diff to understand what changed (additions, deletions, modified files)
   - Create a descriptive message for the commit message

3. **Commit:**
   ```bash
   git commit -m "$COMMIT_MSG"
   ```
