# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue.
Instead, contact the repository owner directly.

---

## Incident: `.env` File Exposed in Git History

### What happened

A root `.env` file containing real credentials was accidentally committed in commit
`608ecfe` and subsequently removed in commits `79d6627` and `f99cc56`. Although
the file no longer exists in `HEAD`, the secrets remain accessible in the git history.

### Affected credentials

Any values that were present in the `.env` file at the project root, which may include:

- commercetools API client ID and secret (`CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`)
- commercetools project key (`CTP_PROJECT_KEY`)
- JWT signing secret (`JWT_SECRET`)
- Redis / Upstash connection strings and tokens

### Required actions

**You must complete all of the following steps:**

#### 1. Rotate all exposed credentials immediately

| Credential | Where to rotate |
|---|---|
| `CTP_CLIENT_ID` / `CTP_CLIENT_SECRET` | Merchant Center → Settings → Developer Settings → API Clients — delete the old client and create a new one |
| `CTP_PROJECT_KEY` | Cannot be changed; ensure the old API client is revoked |
| `JWT_SECRET` | Generate a new strong random string and update in all deployment environments |
| `REDIS_URL` / Upstash tokens | Regenerate tokens in your Upstash dashboard |
| Any GCP service-account keys | Rotate in Google Cloud IAM console |

#### 2. Purge the secret from git history

Even after removing the file, the content is still present in past commits. To
permanently remove it you must rewrite history using one of these tools:

**Option A — `git filter-repo` (recommended):**

```bash
# Install
pip install git-filter-repo

# Remove the file from all history
git filter-repo --path .env --invert-paths --force

# Force-push all branches and tags
git push origin --force --all
git push origin --force --tags
```

**Option B — BFG Repo Cleaner:**

```bash
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

> **Important:** After a force-push, all collaborators must re-clone or
> hard-reset their local copies (`git fetch && git reset --hard origin/<branch>`).

#### 3. Notify GitHub Support

Go to <https://support.github.com> and request that GitHub's caches for the
affected commits be purged, since even after a force-push GitHub may cache old
objects for a period of time.

---

## Prevention

The `.gitignore` has been updated to block all `.env` variants:

```
**/.env
**/.env.local
**/.env.*.local
**/.env.production
**/.env.staging
**/.env.development
```

Never commit real credentials. Use `.env.example` files with placeholder values
for documentation, and inject real secrets via CI/CD environment variables or
a secrets manager (e.g. GitHub Secrets, GCP Secret Manager).
