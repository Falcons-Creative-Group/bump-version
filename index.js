const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

const tagFormat = core.getInput('tag-format');

// Log tag format.
console.log('\x1b[33m%s\x1b[0m', `Tag format: ${tagFormat}`);

// List all existing tags.
// Filter tags that match the current app's pattern.
// Extract the version part from these tags.
// Sort them to find the highest version.
// Increment the version based on your versioning scheme (e.g., semantic versioning).

/**
 * Generate regex pattern to be used to filter tags.
 * @param {string} formatString.
 * @returns {string} regex pattern to be used to filter tags.
 */
function generateRegexPattern(formatString) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // +1 because getMonth() is zero-indexed

    // Replace placeholders with actual year and month
    return formatString.replace('${year}', year)
                       .replace('${month}', month)
                       .replace('${rev}', '\\d+');
}

/**
 * Fetches git tags and filters them based on a provided regex pattern. If no pattern is provided,
 * it returns all git tags.
 * @param {string} [pattern] The optional regex pattern to filter the tags.
 * @returns {string[]} An array of tags that match the given pattern, or all tags if no pattern is provided.
 */
function getTags(pattern) {
    try {
        // Fetch all tags from remote to ensure the local repository is up to date
        execSync('git fetch --tags');

        // Get all tags from the Git repository and split them into an array
        const tags = execSync('git tag').toString().split('\n').filter(Boolean);

        // If no pattern is provided, return all tags
        if (!pattern) {
            return tags;
        }

        // Create a RegExp object from the provided pattern
        const regex = new RegExp(pattern);

        // Filter the tags based on the regex pattern
        return tags.filter(tag => regex.test(tag));
    } catch (error) {
        // Handle and log any errors that occur during execution
        console.error(`Failed to fetch or filter tags: ${error.message}`);
        return [];  // Return an empty array in case of error
    }
}

try {

    // Generate regex pattern to be used to filter tags
    const regexPattern = generateRegexPattern(tagFormat);
    console.log('\x1b[33m%s\x1b[0m', `Regex pattern: ${regexPattern}`);

    tags = getTags(regexPattern);
    console.log('\x1b[33m%s\x1b[0m', `Tags: ${tags}`);

} catch (error) {
    core.setFailed(error.message);
}