const core = require('@actions/core');

// List all existing tags.
// Filter tags that match the current app's pattern.
// Extract the version part from these tags.
// Sort them to find the highest version.
// Increment the version based on your versioning scheme (e.g., semantic versioning).

function main() {
    const tagFormat = core.getInput('tag-format');
    console.log(`Tag format: ${tagFormat}`);
}

main();