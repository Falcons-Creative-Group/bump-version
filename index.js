const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

// List all existing tags.
// Filter tags that match the current app's pattern.
// Extract the version part from these tags.
// Sort them to find the highest version.
// Increment the version based on your versioning scheme (e.g., semantic versioning).

/**
 *
 * Fetches all git tags from the repository and returns them as an array.
 * @returns {string[]} An array of git tags.
 */
function getTags() {
    return execSync('git fetch --tags && git tag').toString().split('\n').filter(Boolean);
}


try {
    // Get the 'tag-format' input from the workflow file.
    const tagFormat = core.getInput('tag-format');

    try {
        // Get all tags from the repository.
        const tags = getTags();

        if (tags.length > 0) {
            tags.forEach(tag => console.log(tag));
        } else {
            console.log('No tags found.');
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
} catch (error) {
    core.setFailed(error.message);
}