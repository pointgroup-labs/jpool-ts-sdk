/* eslint-disable no-template-curly-in-string */

module.exports = {
  verbose: true,
  git: {
    push: true,
    tagName: '${npm.name}@${version}',
    tagMatch: '${npm.name}@*',
    commitsPath: '.',
    commitMessage: 'chore: release ${version} [no ci]',
    requireCleanWorkingDir: false,
  },
  github: {
    release: false,
    releaseName: '${npm.name}@${version}',
    releaseNotes: ctx => ctx.changelog.split('\n').slice(1).join('\n'),
  },
  plugins: {
    // 'release-it-pnpm': {},
    '@release-it/conventional-changelog': {
      path: '.',
      gitRawCommitsOpts: {
        path: '.',
      },
      header: '# Changelog',
      infile: 'CHANGELOG.md',
      preset: {
        name: 'conventionalcommits',
        types: [
          { type: 'feat', section: '🌟 Features' },
          { type: 'fix', section: '🐞 Bug Fixes' },
          { type: 'infra', section: '🏗 Internal improvements', hidden: true },
          { type: 'perf', section: '⚡️ Performance enhancements' },
          { type: 'chore', section: '🧼 Chores', hidden: true },
          { type: 'test', section: '✅ Test coverage', hidden: true },
          { type: 'docs', section: '📚 Documentation' },
          { type: 'refactor', section: '♻️ Refactors' },
        ],
      },
    },
  },
  hooks: {
    'after:git:release': 'pnpm publish --access public --no-git-checks',
    'after:release': 'echo 🥳 Successfully released ${name}:${version}',
  },
  npm: {
    publish: false,
  },
}
