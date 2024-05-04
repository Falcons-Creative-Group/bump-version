const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require('child_process');

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


try {

    // Generate regex pattern to be used to filter tags
    const regexPattern = generateRegexPattern(tagFormat);
    console.log('\x1b[33m%s\x1b[0m', `Regex pattern: ${regexPattern}`);

} catch (error) {
    core.setFailed(error.message);
}