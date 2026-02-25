---
name: 'step-07-git-commit-pr'
description: 'Commit changes to feature branch and open Pull Request to develop'
---

# Step 7: GitFlow Finalization — Commit & Open PR

**Goal:** Commit all implementation work and open a Pull Request to `develop`. This step is mandatory and completes the Quick Dev workflow.

---

## AVAILABLE STATE

From previous steps:
- `{baseline_commit}` - Git HEAD at workflow start
- `{feature_branch_name}` - Feature branch created in Step 0
- `{git_enabled}` - Whether Git is available
- `{execution_mode}` - "tech-spec" or "direct"
- `{tech_spec_path}` - Path to tech-spec (if Mode A)

---

## CHECK GIT STATUS

If `{git_enabled}` == false:

```
⚠️ Git is not enabled for this project.

Manual actions required:
1. Stage changes: git add .
2. Commit: git commit -m "feat(scope): description of changes"
3. Push: git push -u origin <branch-name>
4. Open PR: Use GitHub web UI or gh pr create --base develop

Instructions complete. End workflow.
```

**HALT** — User must manually commit and open PR.

---

If `{git_enabled}` == true, continue below.

---

## STAGE & REVIEW CHANGES

Display what changed:

```bash
git status
```

Expected output: Shows modified files, new files, deleted files.

Stage all changes:

```bash
git add .
```

Verify:

```bash
git status
```

Expected: "Changes to be committed" with all files listed.

---

## CREATE CONVENTIONAL COMMIT MESSAGE

Follow conventional commits format:

**Pattern:** `<type>(<scope>): <subject>`

**Type:** One of—
- `feat` — New feature
- `fix` — Bug fix
- `chore` — Maintenance (dependencies, config, docs)
- `test` — Test additions
- `perf` — Performance improvement

**Scope:** Area affected—
- `api` — Backend API
- `web` — Frontend
- `ci` — CI/CD
- `infra` — Infrastructure/deployment
- Or a specific module name

**Subject:** Short summary (imperative mood, lowercase, no period)

**Examples:**
- `feat(api): add user authentication endpoints`
- `feat(web): implement checkout flow`
- `fix(api/cart): resolve session expiry bug`
- `chore(deps): update commercetools SDK to v2.5.0`
- `feat(ci): add github actions workflow for deployments`

---

## COMMIT CHANGES

```bash
git commit -m "<conventional_commit_message>"
```

Confirm success:

```bash
git log -1 --oneline
```

Should show your commit message.

---

## PUSH FEATURE BRANCH

Push to remote with upstream tracking:

```bash
git push -u origin {feature_branch_name}
```

Expected output:
- "Create pull request for {feature_branch_name} on GitHub"
- Or similar GitHub prompt

---

## CREATE PULL REQUEST

Check if GitHub CLI (`gh`) is available:

```bash
which gh
```

### IF `gh` IS AVAILABLE:

Use GitHub CLI to create PR:

```bash
gh pr create --base develop \
  --title "<conventional_commit_message>" \
  --body "## Changes

Implemented in Quick Dev workflow.

**Files Modified:**
$(git diff --name-only {baseline_commit} HEAD)

**Testing:**
- All tests pass: \`npm test\`
- Manual verification completed

**Next Steps:**
- Code review
- Merge to develop when approved
"
```

Confirm:

```bash
gh pr view
```

**Output:**
```
✅ **Pull Request Created Successfully**

PR Title: <conventional_commit_message>
Branch: {feature_branch_name} → develop
Status: Ready for review

View: gh pr view
or visit GitHub's PR page
```

### IF `gh` IS NOT AVAILABLE:

Display manual PR creation steps:

```
⚠️ GitHub CLI (gh) not found. Manual PR creation required.

**Steps:**
1. Go to: https://github.com/JefinFrancis/ct-b2c-storefront
2. Click "Compare & Pull Request" button (should show {feature_branch_name})
3. Ensure base repository: JefinFrancis/ct-b2c-storefront
4. Ensure base branch: develop
5. Ensure compare branch: {feature_branch_name}
6. Set PR title to: <conventional_commit_message>
7. Set PR description:
   ```
   ## Changes
   
   Implemented in Quick Dev workflow.
   
   **Files Modified:**
   (See commit diff)
   
   **Testing:**
   - All tests pass: npm test
   - Manual verification completed
   
   **Next Steps:**
   - Code review
   - Merge to develop when approved
   ```
8. Click "Create Pull Request"
```

Tell user: "PR creation requires manual setup. See instructions above."

---

## FINAL COMPLETION

**Output:**

```
✅ **Quick Dev Workflow Complete — Fully GitFlow Integrated**

**Implementation Phase Summary:**
✓ Code implemented and tested
✓ Review findings resolved
✓ Changes committed: {conventional_commit_message}
✓ Branch pushed: {feature_branch_name}
✓ Pull Request created/pending (target: develop)

**Next Steps for {user_name}:**
1. Review the PR on GitHub
2. Address any feedback from automated checks
3. Request code review from team members
4. Merge when approved (GitHub UI recommended)
5. Proceed to next feature or task

**Important:**
- Always merge via GitHub UI (Squash & Merge or Merge)
- Never merge directly via git CLI
- Closes any related issues if specified in PR

**Workflow end.** You may now:
- Review the PR on GitHub
- Start a new Quick Dev session
- Run another workflow
- Ask for assistance
```

---

## SUCCESS METRICS

✓ All changes staged with `git add .`
✓ Conventional commit message created
✓ Commit pushed to remote
✓ PR opened to `develop` (automatic or manual)
✓ Completion summary displayed
✓ User knows next steps

## FAILURE MODES

- Not staging all changes before commit
- Commit message not following conventional format
- Pushing to wrong branch
- PR opened to `main` instead of `develop`
- User unclear on merge process
