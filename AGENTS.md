# AGENTS.md

## Development Branch Workflow

All feature, fix, documentation, refactor, test, build, CI, and maintenance work
must follow this workflow.

### Mandatory Rules

- Always create working branches from an up-to-date `develop` branch.
- Always open development pull requests against `develop`.
- Never create a normal working branch from `main`.
- Never open a normal development pull request against `main`.
- Keep each branch focused on one reviewable change.
- Do not push directly to `develop` or `main` unless the user explicitly requests
  a release operation described in this file.
- Update `main` only through the release workflow in the next section.

### Create a Working Branch

Start with a clean worktree, update `develop`, and create a descriptive branch:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c <type>/<short-description>
```

Examples:

```text
feat/add-command-menu
fix/npm-publish-from-package
docs/update-component-guide
```

### Validate and Commit

Run the full repository gate before creating a pull request:

```bash
bun run check
```

Stage only files related to the task and use a concise commit message. Do not
include unrelated worktree changes.

### Push and Open the Pull Request

Push the working branch and explicitly set `develop` as the pull request base:

```bash
git push -u origin <type>/<short-description>
gh pr create --base develop --head <type>/<short-description>
```

Before reporting completion, verify that the pull request base is `develop`.
Use the repository pull request template and write the pull request title and
body in English.

## Release and Tagging

This repository publishes npm packages from GitHub Actions when a tag matching
`v*` is pushed. Follow this process exactly so package versions, branches, tags,
and npm dist-tags stay aligned.

### Agent Rules

- Start a release only after the user explicitly provides the target version.
- Treat version changes, commits, merges, tags, pushes, and branch deletion as
  separate operations. Do not perform a later operation without user approval.
- Start release branches from an up-to-date `develop` branch with a clean worktree.
- Use an annotated tag named `v<VERSION>`. Never use a lightweight tag.
- Never move, replace, or force-push a published tag.
- Push only the release tag, not every local tag.
- The current workflow publishes npm packages; it does not create a GitHub Release.

The examples below use `1.0.0-alpha.1`. Replace it consistently for each release.

### 1. Create the Release Branch

```bash
git switch develop
git pull --ff-only origin develop
git switch -c release-1.0.0-alpha.1
```

The branch must be named `release-<VERSION>`.

### 2. Update Versions

Set `1.0.0-alpha.1` in all version-bearing manifests:

- `package.json`
- `lerna.json`
- `packages/lumen-ui/package.json`
- `packages/lumen-theme-clarity/package.json`
- `packages/lumen-theme-clarity/package.json` peer dependency on Lumen UI
- `playground/package.json`

Regenerate `bun.lock` from those manifests, validate that it is reproducible,
check for stale versions, then run the full release gate:

```bash
bun install
bun install --frozen-lockfile
rg "1\.0\.0-alpha\.0" package.json lerna.json packages playground bun.lock
bun run check
```

The stale-version search must return no matches. Adjust the searched old version
for each release.

Do not use `bun run release` on the release branch. The current Lerna
configuration only allows versioning on `main` and automatically commits, tags,
and pushes, which does not match this release-branch workflow.

### 3. Commit the Version Bump

Stage only the version-related files and use this message format:

```bash
git add bun.lock lerna.json package.json \
  packages/lumen-ui/package.json \
  packages/lumen-theme-clarity/package.json \
  playground/package.json
git commit -m "Bumped version number to 1.0.0-alpha.1"
```

Do not push the release branch unless the user explicitly requests it.

### 4. Merge and Tag Main

```bash
git switch main
git pull --ff-only origin main
git merge --no-ff release-1.0.0-alpha.1 \
  -m "Merge branch 'release-1.0.0-alpha.1' into main"
git tag -a v1.0.0-alpha.1 -m "v1.0.0-alpha.1"
```

Before continuing, verify that the tag points to the merge commit and that the
publishable package versions match the tag:

```bash
git show --no-patch --decorate v1.0.0-alpha.1
rg '"version": "1.0.0-alpha.1"' \
  lerna.json \
  packages/lumen-ui/package.json \
  packages/lumen-theme-clarity/package.json
```

### 5. Merge Back to Develop

```bash
git switch develop
git pull --ff-only origin develop
git merge --no-ff release-1.0.0-alpha.1 \
  -m "Merge branch 'release-1.0.0-alpha.1' into develop"
```

### 6. Push in Release Order

Push the exact tag first to trigger publishing, then push `main`, and finally
push `develop`:

```bash
git push origin v1.0.0-alpha.1
git push origin main
git push origin develop
```

Do not use `git push --tags`.

### 7. Verify GitHub Publishing

The tag triggers `.github/workflows/publish-npm.yml`. The workflow runs
`bun run check`, builds the packages, and uses `lerna publish from-package` to
publish package versions that do not exist in the npm registry. This avoids
merge commits being incorrectly treated as having no changed packages.
Prerelease versions such as `alpha`, `beta`, and `rc` are published under the
npm `next` dist-tag; stable versions use `latest`.

```bash
gh run list --workflow publish-npm.yml --limit 3
gh run watch <RUN_ID> --exit-status
```

The release is complete only after the workflow succeeds. If publishing fails,
do not move or recreate the tag. Rerun the failed workflow for transient failures.
If a previous tag run used `from-git` and skipped publishing, manually run the
updated workflow from `main`:

```bash
gh workflow run publish-npm.yml --ref main
```

Use a new version and tag if a code or package metadata change is required.

### 8. Delete the Release Branch

Delete the local release branch only after `main`, the tag, and `develop` are
pushed and the publishing workflow succeeds:

```bash
git switch develop
git branch -d release-1.0.0-alpha.1
```

If the release branch was explicitly pushed, delete the remote branch separately:

```bash
git push origin --delete release-1.0.0-alpha.1
```
