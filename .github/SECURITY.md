# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main`  | ✅ |
| `develop` | ✅ |
| `< 1.0.0` | ❌ |

Only the latest versions on `main` and `develop` receive security updates.

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, report vulnerabilities via one of the following methods:

1. **GitHub Security Advisories** (preferred): Use the [Security tab](https://github.com/JefinFrancis/ct-b2c-storefront/security/advisories/new) to privately report a vulnerability.
2. **Direct contact**: Reach the maintainer via GitHub — https://github.com/JefinFrancis

### What to Include

- Description of the vulnerability
- Steps to reproduce (proof of concept if possible)
- Impact assessment
- Suggested fix (if any)

### Response Timeline

- **Acknowledgement**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix timeline**: Depends on severity
  - **Critical**: Within 24 hours
  - **High**: Within 7 days
  - **Medium**: Within 30 days
  - **Low**: Next scheduled release

### What Happens After Reporting

1. We will acknowledge receipt of your report
2. We will investigate and assess the impact
3. We will develop and test a fix
4. We will release a patch and publish a security advisory
5. We will credit you (unless you prefer anonymity)

## Security Best Practices

This project follows these security practices:

- **No secrets in code**: All credentials are stored in environment variables and GitHub Secrets
- **Secret scanning**: Enabled via GitHub and gitleaks in CI
- **Dependency scanning**: Dependabot alerts and automated security updates enabled
- **CodeQL analysis**: Static analysis runs on every PR and weekly
- **CT SDK isolation**: commercetools credentials never reach the browser — all CT calls are server-side via NestJS API
- **JWT authentication**: Tokens are signed with configurable secrets and have expiration
- **CORS**: Strict origin policy configured per environment

## Scope

The following are **in scope** for security reports:

- Authentication/authorization bypasses
- Injection vulnerabilities (SQL, NoSQL, XSS, etc.)
- Sensitive data exposure
- CT credential leakage
- CSRF vulnerabilities
- Server-side request forgery (SSRF)

The following are **out of scope**:

- Denial of service attacks
- Social engineering
- Issues in third-party dependencies (report to the upstream project)
- Issues requiring physical access to the server
