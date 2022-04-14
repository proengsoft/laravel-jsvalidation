module.exports = {
  debug: true,
  branch: 'master',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/exec',
    '@semantic-release/git',
    '@semantic-release/github'
  ],
  verifyConditions: [
    '@semantic-release/github',
  ],
  prepare: [
    {
      path: '@semantic-release/exec',
      cmd: 'gulp build'
    },
    {
      path: '@semantic-release/git',
      assets: ["public/**/*"],
      message: "chore(release): ${nextRelease.version} [skip ci]"
    },
  ],
  publish: [
    '@semantic-release/github'
  ]
}
