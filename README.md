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
comment: |
    Some multi-line
    comment which notifies users that labels have been added
labels:
    'bug':
        - '\bbug[s]?\b'
    'help wanted':
        - '\bhelp(ing)?\b'
```

## TODO

* exclusion regex
* ~~PR support~~
* tests

## Contributing

If you have suggestions for how auto-labeler could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 Jim Schubert <james.schubert@gmail.com>
