# bidi-checker-action

A GitHub action that checks for bi-directional unicode characters. 

---

## Summary

This action recursively checks the contents of the target repository for [Unicode Bidi characters](https://unicode.org/reports/tr9/), and reports a successful run if none are present.

The checker uses the GITHUB_WORKSPACE environmental variable, defined in the [GitHub Action Environmental Variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables). By default, the directory this variable defines is empty, so must be populated via the `actions/checkout` GitHub Action for this checker to function properly. See the example usage below.

The checker will ignore the contents of generated .git directories.

## Outputs

* Successful run if no bidi characters are present in code.
* Failed run if bidi characters are present in code.

## Additional Outputs

## `time`

The time in ms required to scan the repository.

## Building

Install the dependencies

```bash
npm install
```

Run the tests :heavy_check_mark:

```bash
$ npm test

 ...

 PASS  ./index.test.js
  ✓ test valid-project (449 ms)
  ✓ test invalid-project (84 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.76 s
Ran all test suites.
...
```


## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage

You can now consume the action by including the following yml configutation in the `.github/workflows` directory of your project.
  
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
        uses: HL7/bidi-checker-action@v1.4
        with: # Placeholder for input parameters
      # Report check runtime in ms
      - name: Get the output time
        run: echo "The time was ${{ steps.bidi_check.outputs.time }}"

  ```

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket:
