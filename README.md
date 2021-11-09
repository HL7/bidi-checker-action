# bidi-checker-action

A GitHub action that checks for bi-directional unicode characters. 

---

## Usage

This action recursively checks the contents of the target repository for [Unicode Bidi characters](https://unicode.org/reports/tr9/), and reports a successful run if none are present.

The checker uses the GITHUB_WORKSPACE environmental variable, defined in the [GitHub Action Environmental Variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables). By default, the directory this variable defines is empty, so must be populated via the `actions/checkout` GitHub Action for this checker to function properly. See the example usage below.

The checker will ignore the contents of generated .git directories.

## Outputs

* Successful run if no bidi characters are present in code.
* Failed run if bidi characters are present in code.

## Additional Outputs

## `time`

The time in ms required to scan the repository.

## Example usage

Include the following yml configutation in your `.github/workflows` directory. 
  
```yaml
# Bidi Checker Action

name: BIDI CHECK

# Controls when the workflow will run
on:
  # Triggers the workflow on push or pull request events but only for the main branch
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

jobs:
  bidi_checker_job:
    runs-on: ubuntu-latest
    name: Check for bidi unicode characters in repo
    steps:
      # Checkout the repo code. IMPORTANT, this step is needed to populate the directory defined by GITHUB_WORKSPACE
      - name: Checkout repo
        uses: actions/checkout@v1
        id: checkout
      # Run the check for bidi characters.
      - name: Check for bidi characters
        id: bidi_check
        uses: HL7/bidi-checker-action@v1.3
        with: # Placeholder for input parameters
      # Report check runtime in ms
      - name: Get the output time
        run: echo "The time was ${{ steps.bidi_check.outputs.time }}"

  ```
