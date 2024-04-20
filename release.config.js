// Semantic Release config

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
	dryRun: true, // TODO: Delete this after testing setup
	branches: ['cicd'],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		'@semantic-release/changelog',
		'@semantic-release/npm',
		[
			'@semantic-release/github',
			{
				successComment: false,
				failComment: false
			}
		],
		'@semantic-release/git'
	]
};
