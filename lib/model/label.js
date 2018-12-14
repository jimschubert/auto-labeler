class Label {
  constructor (label, include, exclude) {
    this.include = include || []
    this.exclude = exclude || []
    this.label = label
  }
}

const defaultLabels = [
  new Label('help wanted', [/\bhelp(ing)?\b/g]),
  new Label('bug', [/\bbug[s]?\b/g])
]

module.exports.Label = Label
module.exports.defaultLabels = defaultLabels
