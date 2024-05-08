# Git Tag Versioning Action

This GitHub Action automates the process of managing version tags in your Git repository. It resolves tag formats, fetches and filters tags, and calculates the next version based on revision numbers.

## Inputs

### `tag-format`

Optional. The tag format string that may contain placeholders for dynamic elements. The current supported placeholders are `${rev}`, `${year}`, and `${month}`. You can include a long prefix such as `${year}.${month}-sg.tk-config-default2.1.4.5.${rev}` to create complex tag structures tailored to your project's needs. Example: `v${rev}`. This input is not required, and if not provided, the default format used will be `v${rev}`, which increments the revision number with each new tag.

### `version-file`

Optional. The path to a JSON file containing custom values for 'year' and 'month'. If provided, these values will be used to replace placeholders in the tag format. If `version-file` is not provided, the action will default to using the current year and month for the placeholders.

### `release-candidate`

Optional. A flag that indicates whether the tag being generated is for a release candidate. Accepts a boolean value (`true` or `false`). When set to `true`, the action will handle versioning to include a release candidate suffix (`-rc1`). This is useful for pre-release versions where you may need additional testing or validation before the final release.

## Outputs

### `version`

The calculated next version of the tag based on the provided tag format and existing tags in the repository.

## Usage

```yaml
name: Versioning

on:
  push:
    branches:
      - main

jobs:
  is-prerelease:
    name: Determine if this is a prerelease
    uses: Falcons-Creative-Group/ci-cd-workflows/.github/workflows/prerelease-check.yml@main

  release:
    name: Release
    needs: is-prerelease
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Bump version
        id: version-increment
        uses: Falcons-Creative-Group/bump-version@main
        with:
          tag-format: '${year}.${month}-sg.tk-config-default2.1.4.5.${rev}'
          version-file: 'version.json'
          release-candidate: ${{ fromJSON(needs.is-prerelease.outputs.is-prerelease) }}

      - name: Print out new version
        run: echo ${{ steps.version-increment.outputs.version }}
```

## Building

To build the action before deploying or testing, sue the following steps:

1. Install `@vercel/ncc` by running:

```
npm install -g @vercel/ncc
```
This will install ncc globally on your machine, allowing you to use it for any project.

2. Navigate to the root directory of your project and run:

```
ncc build ./src/index.js
```
This command compiles the source code located in ./src/index.js into a single minified JavaScript file in the dist directory. This file includes all dependencies, which are necessary for the action to run in GitHub's environment.

## Testing

1. Ensure Jest is installed in your project. If it's not installed, you can install it by running:

```
npm install --save-dev jest
```

2. To run the tests, use the following command:

```
npx jest --verbose
```