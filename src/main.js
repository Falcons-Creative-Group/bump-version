const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Resolves the tag format by replacing placeholders with actual year and month values.
 * @param {string} tagFormat The tag format string that may contain placeholders for 'year' and 'month'.
 * @param {Object} versionObject Optional JSON object containing custom values for 'year' and 'month'.
 * @returns {string} Resolved tag format.
 */
function resolveTagFormat(tagFormat, versionObject) {
  const currentDate = new Date();
  const year = versionObject?.year || currentDate.getFullYear();
  let month = versionObject?.month || currentDate.getMonth() + 1; // +1 because getMonth() is zero-indexed
  month = String(month).padStart(2, '0'); // Ensure month is always two digits

  // Replace placeholders with actual year and month
  return tagFormat.replace('${year}', year).replace('${month}', month);
}

/**
 * Fetches git tags and filters them based on a provided regex pattern. If no pattern is provided,
 * it returns all git tags.
 * @param {string} pattern The optional regex pattern to filter the tags.
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
    console.error(`Failed to fetch or filter tags: ${error.message}`);
    return [];
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
  // Create a regular expression to match the revision part of the tag based on the provided format
  // Replace the ${rev} placeholder with a regex group to capture revision numbers (\d+)
  // Replace all '.' characters with '\.' to escape them in the regex.
  const revisionRegex = new RegExp(tagFormat.replace('${rev}', '(\\d+)').replace(/\./g, '\\.'));
	console.log(`Revision regex: ${revisionRegex}`);

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
 * @returns {Promise<void>} A promise that resolves when the action has completed.
 */
async function run() {
  try {
    const tagFormat = core.getInput('tag-format');
    const versionFile = core.getInput('version-file');

    let versionObject;

    if (versionFile && fs.existsSync(versionFile)) {
      const versionString = fs.readFileSync(versionFile, 'utf8');
      versionObject = JSON.parse(versionString);
      console.log(`Version file content: ${JSON.stringify(versionObject)}`);
    }
    const resolvedTagFormat = resolveTagFormat(tagFormat, versionObject);

    // Generate regex pattern to be used to filter tags
    const pattern = resolvedTagFormat.replace('${rev}', '\\d+');
    console.log(`Regex pattern: ${pattern}`);

    const tags = getTags(pattern);
    console.log(`Tags: ${tags}`);

    const nextVersion = getNextVersion(tags, resolvedTagFormat);
    console.log(`Next version: ${nextVersion}`);

    core.setOutput('version', nextVersion);

    // Output the payload for debugging
    core.info(
      `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
    )
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = {
  run
};