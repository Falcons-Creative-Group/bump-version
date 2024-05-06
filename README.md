# Git Tag Versioning Action

This GitHub Action automates the process of managing version tags in your Git repository. It resolves tag formats, fetches and filters tags, and calculates the next version based on revision numbers.

## Inputs

### `tag-format`

**Required** The tag format string that may contain placeholders for 'year', 'month', and 'revision'. Example: `v${year}.${month}-sg.tk-config-default2.1.4.5.${rev}`

### `version-file`

The path to a JSON file containing custom values for 'year' and 'month'. If provided, these values will be used to replace placeholders in the tag format.

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
  version:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run versioning action
        id: versioning
        uses: Falcons-Creative-Group/bump-version@implement-functionality-of-bump-version
        with:
          tag-format: '${year}.${month}-sg.tk-config-default2.1.4.5.${rev}'
          version-file: 'version.json'

      - name: Get the version number
        run: echo "The next version is ${{ steps.versioning.outputs.version }}"
```