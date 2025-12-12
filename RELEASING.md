# Release Guide

This guide covers how to release new versions of packages in this monorepo using semantic-release.

## Overview

This monorepo uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and releases. Versions are determined automatically based on commit messages following the Conventional Commits specification.

## Commit Message Format

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

The type determines the version bump:

- **feat**: A new feature (triggers MINOR release: 1.0.0 → 1.1.0)
- **fix**: A bug fix (triggers PATCH release: 1.0.0 → 1.0.1)
- **docs**: Documentation only changes (no release)
- **style**: Code style changes (formatting, semicolons, etc.) (no release)
- **refactor**: Code changes that neither fix bugs nor add features (no release)
- **perf**: Performance improvements (triggers PATCH release)
- **test**: Adding or updating tests (no release)
- **chore**: Maintenance tasks (no release)
- **ci**: CI/CD changes (no release)
- **build**: Build system or dependency changes (no release)

### Breaking Changes

To trigger a MAJOR version bump (1.0.0 → 2.0.0), use either:

1. Add `BREAKING CHANGE:` in the commit body or footer:
   ```
   feat(core): add new authentication system

   BREAKING CHANGE: The old auth methods have been removed.
   Use the new authenticate() function instead.
   ```

2. Add `!` after the type/scope:
   ```
   feat(core)!: remove deprecated methods
   ```

### Scope

The scope indicates which package is affected:

- `core` - For @reallygoodwork/core package
- Add new scopes for future packages

### Examples

**Feature (Minor Release)**
```
feat(core): add logging utility function

Adds a new log() function for consistent logging across the application.
```

**Bug Fix (Patch Release)**
```
fix(core): correct return type in hello function

The hello function was returning undefined in edge cases.
```

**Breaking Change (Major Release)**
```
feat(core)!: change hello function signature

BREAKING CHANGE: hello() now requires a name parameter.
Before: hello() → "Hello, World!"
After: hello("Alice") → "Hello, Alice!"
```

**Non-Release Commits**
```
docs(core): update API documentation

chore: update dependencies

test(core): add unit tests for hello function
```

## Release Process

### Automated (Recommended)

1. **Make changes** to your package code
2. **Commit with proper format**:
   ```bash
   git add .
   git commit -m "feat(core): add new utility function"
   ```
3. **Push to main branch**:
   ```bash
   git push origin main
   ```
4. **CI/CD automatically**:
   - Analyzes commit messages
   - Determines version bump
   - Updates package.json version
   - Generates CHANGELOG.md
   - Creates git tag
   - Publishes to npm
   - Creates GitHub release

### Manual (Testing)

To test releases locally without publishing:

```bash
cd packages/core
pnpm release --dry-run
```

This shows what would happen without making changes.

## CI/CD Setup

This repository includes two GitHub Actions workflows for continuous integration and automated releases.

### Workflows

#### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main`:
- Runs tests
- Runs linting
- Checks TypeScript types
- Builds all packages

#### 2. Release Workflow (`.github/workflows/release.yml`)

Runs on every push to `main` (after CI passes):
- Builds packages
- Analyzes commit messages
- Publishes new versions to npm
- Creates GitHub releases
- Updates CHANGELOG.md

### Required Secrets

Configure these in your GitHub repository settings (Settings → Secrets and variables → Actions):

#### `NPM_TOKEN` (Required)

npm authentication token for publishing packages:

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Go to Access Tokens → Generate New Token
3. Select "Automation" type
4. Copy the token
5. Add as `NPM_TOKEN` secret in GitHub

#### `GITHUB_TOKEN` (Automatic)

The `GITHUB_TOKEN` is automatically provided by GitHub Actions with the necessary permissions. No manual setup required.

### Repository Permissions

The release workflow requires these permissions (already configured in `.github/workflows/release.yml`):

```yaml
permissions:
  contents: write       # Create releases and tags
  issues: write        # Comment on released issues
  pull-requests: write # Comment on released PRs
  id-token: write     # npm provenance
```

### Triggering Releases

Releases are triggered automatically when you push commits with conventional commit messages to `main`:

```bash
git commit -m "feat(core): add new feature"
git push origin main
# → Triggers release workflow → Publishes new version
```

## Adding New Packages

When adding a new package to release:

1. **Install dependencies**:
   ```bash
   cd packages/your-package
   pnpm add -D semantic-release @semantic-release/git @semantic-release/changelog
   ```

2. **Create `.releaserc.json`**:
   ```json
   {
     "branches": ["main"],
     "tagFormat": "@reallygoodwork/your-package@${version}",
     "plugins": [
       "@semantic-release/commit-analyzer",
       "@semantic-release/release-notes-generator",
       "@semantic-release/changelog",
       "@semantic-release/npm",
       [
         "@semantic-release/git",
         {
           "assets": ["CHANGELOG.md", "package.json"],
           "message": "chore(release): @reallygoodwork/your-package@${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
         }
       ],
       "@semantic-release/github"
     ]
   }
   ```

3. **Update package.json**:
   ```json
   {
     "scripts": {
       "release": "semantic-release"
     },
     "publishConfig": {
       "access": "public"
     }
   }
   ```

4. **Add to CI workflow** to release the new package

## Troubleshooting

### No release created

- Ensure commits follow Conventional Commits format
- Check that commits contain release-worthy types (`feat`, `fix`, etc.)
- Verify branch is `main` (or configured branch)

### Release failed

- Check `GITHUB_TOKEN` and `NPM_TOKEN` are set correctly
- Ensure tokens have proper permissions
- Verify package builds successfully before release
- Check npm registry credentials

### Wrong version bump

- Review commit message types
- Use `BREAKING CHANGE:` for major versions
- Use `feat:` for minor versions
- Use `fix:` for patch versions

## Best Practices

1. **Commit early and often** with descriptive messages
2. **One logical change per commit** for accurate versioning
3. **Use conventional commits** consistently across the team
4. **Test before merging** to main branch
5. **Review CHANGELOG** after releases to ensure accuracy
6. **Squash PRs** with a properly formatted commit message
