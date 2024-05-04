const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

// Log tag format.
console.log('\x1b[33m%s\x1b[0m', `Tag format: ${tagFormat}`);

// List all existing tags.
// Filter tags that match the current app's pattern.
// Extract the version part from these tags.
// Sort them to find the highest version.
// Increment the version based on your versioning scheme (e.g., semantic versioning).


/**
 * Resolves the tag format by replacing placeholders with actual year and month values.
 * @param {string} tagFormat
 * @returns {string} resolved tag format.
 */
function resolveTagFormat(tagFormat) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // +1 because getMonth() is zero-indexed

    // Replace placeholders with actual year and month
    return tagFormat.replace('${year}', year)
                    .replace('${month}', month)
}

/**
 * Fetches git tags and filters them based on a provided regex pattern. If no pattern is provided,
 * it returns all git tags.
 * @param {string} [pattern] The optional regex pattern to filter the tags.
 * @returns {string[]} An array of tags that match the given pattern, or all tags if no pattern is provided.
 */
function getTags(tagFormat) {
    // Generate regex pattern to be used to filter tags
    const pattern = tagFormat.replace('${rev}', '\\d+');
    console.log('\x1b[33m%s\x1b[0m', `Regex pattern: ${pattern}`);

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

/**
 * Extracts revision numbers from a list of tag strings, finds the highest revision number, increments it,
 * and returns the next version of the tag. If no tags are provided, returns the tag with the revision number set to 1.
 * @param {string[]} tagArray An array of tag strings.
 * @param {string} tagFormat The format string for the tag which includes a ${revision} placeholder for the revision number.
 * @returns {string} The next version of the tag with the incremented revision number or with the revision number set to 1 if no tags are present.
 */
function getNextVersion(tagArray, tagFormat) {
    // TODO: Add support for version increment based on your versioning scheme (e.g., semantic versioning)?

    if (tagArray.length === 0) {
        // If no tags are present, return the tag with revision number set to 1
        return tagFormat.replace('${rev}', '1');
    }

    // Create a regular expression to match the revision part of the tag based on the provided format
    // Replace the ${revision} placeholder with a regex group to capture revision numbers (\d+)
    const revisionRegex = new RegExp(tagFormat.replace('${rev}', '(\\d+)').replace(/\./g, '\\.'));

    let highestRevision = 0;

    tagArray.forEach(tag => {
        const match = tag.match(revisionRegex);
        if (match) {
            // Parse the revision number and compare it to the current highest number
            const revisionNumber = parseInt(match[1], 10);
            if (revisionNumber > highestRevision) {
                highestRevision = revisionNumber;
            }
        }
    });

    const nextRevisionNumber = highestRevision + 1;

    return tagFormat.replace('${rev}', nextRevisionNumber);
}

/**
 * Main function that orchestrates the execution of the action.
 */
function run() {
    try {
        const tagFormat = core.getInput('tag-format');

        const resolvedTagFormat = resolveTagFormat(tagFormat);

        const tags = getTags(resolvedTagFormat);
        console.log('\x1b[33m%s\x1b[0m', `Tags: ${tags}`);

        const nextVersion = getNextVersion(tags, resolvedTagFormat);
        console.log('\x1b[33m%s\x1b[0m', `Next version: ${nextVersion}`);

        core.setOutput('version', nextVersion);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
