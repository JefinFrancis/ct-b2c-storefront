---
name: 'step-00-git-init'
description: 'Initialize GitFlow - create feature branch from develop'

nextStepFile: './step-01-mode-detection.md'
---

# Step 0: GitFlow Initialization

**Goal:** Create a feature branch from `develop` for all implementation work. This is mandatory and non-negotiable.

---

## AVAILABLE STATE

From parent workflow initialization:
- `{project-root}` - Project root path
- `{user_name}` - Username (for messaging)
- `{communication_language}` - Language for output

---

## CHECK GIT AVAILABILITY

First, verify this is a Git repository:

```bash
# Check if .git directory exists OR
git rev-parse --is-inside-work-tree
```

**If NOT a Git repository:**
- Output: ⚠️ "Project is not a Git repository. Git enforcement cannot be applied."
- Ask user if they want to initialize Git: `git init && git add . && git commit -m "Initial commit"`
- If user declines: Set session variable `{git_enabled}` = false and continue to step 1
- If user agrees: Run init commands, then continue

**If IS a Git repository:**
- Set session variable `{git_enabled}` = true
- Continue below

---

## ENSURE ON DEVELOP BRANCH

Git repos must start from the `develop` branch:

```bash
git rev-parse --abbrev-ref HEAD
```

**If current branch is NOT develop:**
- Check if the branch is 'main' or 'production': If yes, **HALT** with "Cannot branch from production. Please checkout develop first: `git checkout develop`"
- Otherwise: Ask user "Current branch is {current_branch}. Switch to develop?" 
  - If yes: Run `git checkout develop && git pull origin develop` (to get latest)
  - If no: **HALT** "Branching from {current_branch} is not permitted. Please use develop as base."

**If already on develop:**
- Good. Continue.

---

## CAPTURE BASELINE COMMIT

For later diff purposes (Step 5 adversarial review):

```bash
git rev-parse HEAD
```

Store as session variable: `{baseline_commit}` = <commit_hash>

---

## DETERMINE FEATURE BRANCH NAME

Construct a branch name following GitFlow convention:

**Pattern:** `feature/CT-<descriptor>`

Where `<descriptor>` is one of:
- **If you know the feature scope**, use: `feature/CT-<id>-short-description` (e.g., `feature/CT-8-cicd-setup`)
- **If no ID yet**, use: `feature/CT-<timestamp>` (e.g., `feature/CT-20260225-185532`)
- **If doing a chore/fix**, use: `chore/<description>` or `fix/<description>`

**Examples:**
- `feature/CT-8-cicd-pipeline-github-actions`
- `feature/CT-9-gcp-deployment`
- `chore/dependency-update`
- `fix/cart-session-expiry`

Store as session variable: `{feature_branch_name}` = <calculated_branch_name>

---

## CREATE FEATURE BRANCH

```bash
git checkout -b {feature_branch_name}
```

Confirm output shows: "Switched to a new branch '{feature_branch_name}'"

---

## OUTPUT SUMMARY

```
✅ **GitFlow Initialized**

**Branch Name:** {feature_branch_name}
**Base Branch:** develop  
**Baseline Commit:** {baseline_commit}
**Git Enabled:** {git_enabled}

ℹ️ All implementation work will be committed to this branch.
After completion, a PR will be opened to develop.

---

**Next Step:** Load and follow step-01-mode-detection.md
```

---

## NEXT STEP

When complete, load and follow: `step-01-mode-detection.md`
