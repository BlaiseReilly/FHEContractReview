# CI/CD Guide - Privacy Contract Review Platform

## Overview

This project includes comprehensive CI/CD (Continuous Integration/Continuous Deployment) workflows using GitHub Actions to ensure code quality, security, and reliability.

---

## Automated Workflows

### 1. Test Suite (`test.yml`)

**Triggers**:
- Every push to `main`, `develop`, or `master`
- All pull requests

**Jobs**:
- Runs on Node.js 18.x and 20.x
- Executes Solhint linting
- Checks code formatting
- Compiles contracts
- Runs full test suite
- Generates gas reports
- Comments results on PRs

**Configuration**:
```yaml
Strategy: Matrix testing
Node Versions: 18.x, 20.x
Parallel Execution: Yes
Fail Fast: No
```

---

### 2. Code Coverage (`coverage.yml`)

**Triggers**:
- Every push to `main`, `develop`, or `master`
- All pull requests

**Jobs**:
- Generates coverage reports
- Uploads to Codecov
- Creates coverage summary
- Checks coverage thresholds (80%)
- Comments coverage on PRs

**Thresholds**:
- Lines: 80%
- Statements: 80%
- Functions: 80%
- Branches: 80%

---

### 3. Security Audit (`security.yml`)

**Triggers**:
- Every push to `main`, `develop`, or `master`
- All pull requests
- Weekly schedule (Mondays at 00:00 UTC)

**Jobs**:

#### NPM Security Audit
- Runs `npm audit`
- Checks for vulnerabilities
- Reports critical/high/moderate/low issues

#### Solidity Security Analysis
- Runs Solhint security checks
- Checks for reentrancy patterns
- Identifies unchecked external calls
- Verifies access control

---

### 4. Continuous Integration (`ci.yml`)

**Triggers**:
- Every push to `main`, `develop`, or `master`
- All pull requests

**Jobs**:

1. **Code Quality Checks**
   - Prettier formatting
   - Solhint linting
   - ESLint checks

2. **Contract Compilation**
   - Compiles all contracts
   - Checks contract sizes
   - Uploads artifacts

3. **Test Matrix**
   - Tests on multiple Node versions
   - Tests on multiple OS (ubuntu-latest)
   - Parallel execution

4. **Build Verification**
   - Checks deployment scripts
   - Verifies configuration files
   - Ensures build readiness

---

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions are automatically enabled for all repositories. No additional setup required.

### 2. Configure Codecov (Optional)

For coverage reporting:

1. Sign up at [Codecov.io](https://codecov.io)
2. Add your repository
3. Get your `CODECOV_TOKEN`
4. Add to repository secrets:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: Your token from Codecov
   - Click "Add secret"

### 3. Configure Branch Protection (Recommended)

Protect your main branch:

1. Go to Settings → Branches
2. Add branch protection rule
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - Select required checks:
     - `Run Tests on Node 18.x`
     - `Run Tests on Node 20.x`
     - `Code Quality Checks`
     - `Compile Contracts`
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging

---

## Workflow Details

### Test Workflow

```
┌─────────────────────────────────────┐
│  Push to main/develop/PR            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Checkout Code                      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Setup Node.js (18.x, 20.x)        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Install Dependencies (npm ci)      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Run Solhint                        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Check Formatting                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Compile Contracts                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Run Tests                          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Generate Gas Report                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Upload Artifacts                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Comment on PR (if PR)              │
└─────────────────────────────────────┘
```

### Coverage Workflow

```
┌─────────────────────────────────────┐
│  Push to main/develop/PR            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Compile & Run Coverage             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Upload to Codecov                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Generate Summary                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Check Thresholds (80%)             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Comment on PR                      │
└─────────────────────────────────────┘
```

---

## Local Testing

### Run All CI Checks Locally

```bash
# 1. Code formatting
npm run format:check

# 2. Linting
npm run lint:sol
npm run lint:js

# 3. Compilation
npm run compile

# 4. Tests
npm test

# 5. Coverage
npm run test:coverage

# 6. Gas reporting
npm run test:gas
```

### Run All Checks at Once

```bash
# Create a script to run all checks
./scripts/ci-local.sh
```

---

## CI/CD Best Practices

### 1. Always Run Tests Locally First

Before pushing code:
```bash
npm test
npm run lint:sol
npm run format:check
```

### 2. Keep Dependencies Updated

```bash
npm audit
npm outdated
npm update
```

### 3. Monitor Gas Costs

Review gas reports in PR comments to catch gas regressions.

### 4. Maintain High Coverage

Aim for >80% coverage on all metrics. Coverage reports show gaps.

### 5. Fix Security Issues Promptly

Address vulnerabilities found by `npm audit` and Solhint.

---

## Troubleshooting

### Tests Failing in CI but Pass Locally

**Causes**:
- Different Node.js version
- Missing environment variables
- Cached dependencies

**Solutions**:
```bash
# Use same Node version as CI
nvm use 20

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Run tests
npm test
```

### Coverage Upload Failing

**Cause**: Missing CODECOV_TOKEN

**Solution**:
1. Get token from Codecov.io
2. Add to GitHub repository secrets
3. Re-run workflow

### Linting Errors in CI

**Cause**: Code not formatted or linted locally

**Solution**:
```bash
# Auto-fix formatting
npm run format

# Check linting
npm run lint:sol
npm run lint:js
```

### Workflow Not Triggering

**Causes**:
- Workflow file syntax error
- Branch not configured in triggers
- GitHub Actions disabled

**Solutions**:
1. Validate YAML syntax
2. Check branch name in workflow file
3. Enable Actions in repository settings

---

## Workflow Files

All workflow files located in `.github/workflows/`:

| File | Purpose | Trigger |
|------|---------|---------|
| `test.yml` | Run test suite | Push, PR |
| `coverage.yml` | Generate coverage | Push, PR |
| `security.yml` | Security audit | Push, PR, Schedule |
| `ci.yml` | Full CI checks | Push, PR |

---

## Status Badges

Add to README.md:

```markdown
[![Test Suite](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
[![Security](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/security.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/security.yml)
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
```

---

## Monitoring

### View Workflow Runs

1. Go to "Actions" tab in GitHub repository
2. View recent workflow runs
3. Click on run for detailed logs
4. Check individual job results

### Debugging Failed Runs

1. Click on failed job
2. Expand failing step
3. Review error logs
4. Fix issue locally
5. Push fix

### Performance Metrics

Monitor in Actions tab:
- Average run time
- Success rate
- Flaky tests
- Resource usage

---

## Advanced Configuration

### Parallel Test Execution

Workflows use matrix strategy for parallel execution:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
  fail-fast: false
```

### Caching

Dependencies cached for faster runs:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'npm'
```

### Artifacts

Test results and reports saved:

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: coverage/
    retention-days: 30
```

---

## Codecov Integration

### Coverage Badges

Add to README:
```markdown
[![codecov](https://codecov.io/gh/USERNAME/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/REPO)
```

### Coverage Graphs

View detailed coverage:
- Line coverage over time
- File-level coverage
- Function coverage
- Branch coverage

### Coverage Comments

Codecov automatically comments on PRs with:
- Coverage diff
- Changed files coverage
- Overall coverage change

---

## Security

### NPM Audit

Runs on every push and weekly:
```bash
npm audit --audit-level=moderate
```

### Solhint Security

Checks for:
- Reentrancy vulnerabilities
- Unchecked external calls
- Access control issues
- Common anti-patterns

### Weekly Scans

Security workflow runs every Monday to catch new vulnerabilities.

---

## Continuous Deployment (Future)

### Planned Features

1. **Automatic Testnet Deployment**
   - Deploy to Sepolia on merge to main
   - Automatic contract verification
   - Deployment notifications

2. **Release Automation**
   - Automatic version bumping
   - Changelog generation
   - GitHub releases

3. **Production Deployment**
   - Manual approval required
   - Mainnet deployment
   - Post-deployment verification

---

## Summary

### CI/CD Features

✅ **Automated Testing**
- Multi-version Node.js testing
- Parallel test execution
- Gas reporting

✅ **Code Quality**
- Prettier formatting
- Solhint linting
- ESLint checks

✅ **Coverage Tracking**
- Codecov integration
- 80% threshold enforcement
- PR comments

✅ **Security Auditing**
- NPM vulnerability scanning
- Solidity security analysis
- Weekly automated scans

✅ **Build Verification**
- Contract compilation
- Deployment script checks
- Configuration validation

---

**Last Updated**: 2024
**Workflows**: 4 active
**Coverage Target**: 80%
**Security Scans**: Weekly
