# auto-labeler

> A GitHub App built with [Probot](https://github.com/probot/probot) that A Probot app which automatically labels GitHub Issues and Pull Requests.

Currently, this only supports self-hosted instances. Read up on Probot's development/deployment guidelines to get setup.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Configuration

Create a YAML document in your repository at `.github/auto-labeler.yml`, with the format:

```yaml
# auto-labeler "simple" schema
# Comment is applied to both issues and pull requests.
# If you need a more robust solution, consider the "full" schema.
comment: |
  👍 Thanks for this!
  🏷 I have applied any labels matching special text in your issue.

  Please review the labels and make any necessary changes.
# Labels is an object where:
# - keys are labels
# - values are array of string patterns to match against title + body in issues/prs
labels:
  'bug':
    - '\bbug[s]?\b'
  'help wanted':
    - '\bhelp( wanted)?\b'
  'duplicate':
    - '\bduplicate\b'
    - '\bdupe\b'
  'enhancement':
    - '\benhancement\b'
  'question':
    - '\bquestion\b'
```

This will apply the labeling rules for all issues and pull requests.

For more control, consider the "full" schema:

```yaml
# auto-labeler "full" schema

# enable auto-labeler on issues, prs, or both.
enable:
  issues: true
  prs: true
# comments object allows you to specify a different message for issues and prs

comments:
  issues: |
    Thanks for opening this issue!
    I have applied any labels matching special text in your title and description.

    Please review the labels and make any necessary changes.
  prs: |
    Thanks for the contribution!
    I have applied any labels matching special text in your title and description.

    Please review the labels and make any necessary changes.

# Labels is an object where:
# - keys are labels
# - values are objects of { include: [ pattern ], exclude: [ pattern ] }
#    - pattern must be a valid regex, and is applied globally to
#      title + description of issues and/or prs (see enabled config above)
#    - 'include' patterns will associate a label if any of these patterns match
#    - 'exclude' patterns will ignore this label if any of these patterns match
labels:
  'bug':
    include:
      - '\bbug[s]?\b'
    exclude: []
  'help wanted':
    include:
      - '\bhelp( me)?\b'
    exclude:
      - '\b\[test(ing)?\]\b'
  'enhancement':
    include:
      - '\bfeat\b'
    exclude: []

```

## Contributing

If you have suggestions for how auto-labeler could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 Jim Schubert <james.schubert@gmail.com>
