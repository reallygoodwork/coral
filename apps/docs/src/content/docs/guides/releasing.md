---
title: Releasing Packages
description: How to release new versions of packages using semantic-release.
---

This guide covers automated versioning and releases using semantic-release.

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>
```

### Types and Version Bumps

- **feat**: New feature (minor: 1.0.0 → 1.1.0)
- **fix**: Bug fix (patch: 1.0.0 → 1.0.1)
- **docs**: Documentation (no release)
- **chore**: Maintenance (no release)
- **BREAKING CHANGE**: Breaking change (major: 1.0.0 → 2.0.0)

### Examples

**Feature (Minor Release)**
```bash
git commit -m "feat(core): add logging utility"
```

**Bug Fix (Patch Release)**
```bash
git commit -m "fix(core): correct return type"
```

**Breaking Change (Major Release)**
```bash
git commit -m "feat(core)!: change function signature

BREAKING CHANGE: hello() now requires parameters."
```

## Release Process

1. Make changes to package code
2. Commit with proper conventional format
3. Push to main branch
4. CI/CD automatically:
   - Analyzes commits
   - Bumps version
   - Generates changelog
   - Publishes to npm
   - Creates GitHub release

## CI/CD Setup

Required environment variables:
- `GITHUB_TOKEN` - For creating releases
- `NPM_TOKEN` - For publishing packages

## Testing Releases

Test locally without publishing:

```bash
cd packages/core
pnpm release --dry-run
```

For complete details, see the [Release Guide](https://github.com/reallygoodwork/coral-libraries/blob/main/RELEASING.md) in the repository.
