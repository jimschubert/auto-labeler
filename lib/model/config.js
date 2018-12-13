const Joi = require('joi')
const Label = require('./label').Label
const Comments = require('./comments').Comments
const defaultLabels = require('./label').defaultLabels
const defaultComments = require('./comments').defaultComments

const simpleSchema = require('../schema/simpleSchema')
const fullSchema = require('../schema/fullSchema')

function isObjectWithKeys (obj) {
  if (obj === null || obj === undefined) return false

  return typeof obj === 'object' && Object.keys(obj).length > 0
}

class ConfigError extends Error {
  constructor (message, validationError) {
    super(message)
    this.name = this.constructor.name
    // exclude constructor function from stack trace.
    Error.captureStackTrace(this, this.constructor)

    this.validationError = validationError
  }
}

class Config {
  constructor (enabled, labels, comments) {
    this.enabled = enabled || {
      issues: true,
      prs: true
    }

    if (Array.isArray(labels)) {
      // TODO : typed
      this._labels = labels
    } else if (isObjectWithKeys(labels)) {
      for (const labelName in labels) {
        if (labels.hasOwnProperty(labelName)) {
          let includeSet = new Set()
          let excludeSet = new Set()
          let matchAgainst = null
          let doNotMatchAgainst = null
          if (Array.isArray(labels[labelName])) {
            matchAgainst = labels[labelName]
            doNotMatchAgainst = []
          } else {
            matchAgainst = labels[labelName].include || []
            doNotMatchAgainst = labels[labelName].exclude || []
          }
          matchAgainst.forEach(regex => {
            includeSet.add(new RegExp(regex, 'g'))
          })
          doNotMatchAgainst.forEach(regex => {
            excludeSet.add(new RegExp(regex, 'g'))
          })

          this.addLabel(labelName, includeSet, excludeSet)
        }
      }
    } else {
      this._labels = defaultLabels
    }

    if (comments instanceof Comments) {
      this._comments = comments
    }
    if (isObjectWithKeys(comments)) {
      let issues = comments.issues
      let prs = comments.prs || issues
      this._comments = new Comments(issues, prs)
    } else {
      this._comments = defaultComments
    }
  }

  get enabled () {
    return this._enabled
  }

  set enabled (value) {
    this._enabled = value
  }

  get labels () {
    return this._labels
  }

  set labels (value) {
    if (Array.isArray(value)) {
      this._labels = value
    } else {
      throw new Error('labels must be an array!')
    }
  }

  addLabel (key, includePatterns, excludePatterns) {
    let include = new Set()
    if (Array.isArray(includePatterns)) {
      for (const p of includePatterns) { include.add(p) }
    } else if (includePatterns instanceof Set) {
      include = includePatterns
    } else {
      include.add(includePatterns)
    }

    let exclude = new Set()
    if (Array.isArray(excludePatterns)) {
      for (const p of excludePatterns) { exclude.add(p) }
    } else if (excludePatterns instanceof Set) {
      exclude = excludePatterns
    } else {
      exclude.add(excludePatterns)
    }

    let label = new Label(
      key,
      [...include].filter(x => x !== null && x !== undefined),
      [...exclude].filter(x => x !== null && x !== undefined)
    )

    if (this._labels === null || this._labels === undefined) {
      this._labels = []
    }

    this._labels.push(label)
  }

  get comments () {
    return this._comments
  }

  set comments (value) {
    if (value instanceof Comments) {
      this._comments = value
    }
  }

  get issueComment () {
    if (this._comments === null || this._comments === undefined) {
      return null
    }
    return this._comments.issues
  }

  set issueComment (value) {
    if (this._comments === null || this._comments === undefined) {
      this._comments = {}
    }
    this._comments.issues = value
  }

  get prComment () {
    if (this._comments === null || this._comments === undefined) {
      return null
    }
    return this._comments.prs
  }

  set prComment (value) {
    if (this._comments === null || this._comments === undefined) {
      this._comments = {}
    }
    this._comments.prs = value
  }
}

class ConfigSimple extends Config {
  constructor (comment, labels) {
    super(null, labels, null)
    super.issueComment = comment
    super.prComment = comment
  }
}

const defaultConfigOptions = {
  // Disallow coercion while evaluating spec validations
  strict: false,
  // Causes config function to throw on error rather than trying multiple schemas
  throws: false
}

function config (obj, options) {
  const opts = options || defaultConfigOptions
  const joiOpts = {
    abortEarly: false,
    convert: !opts.strict
  }

  const full = Joi.validate(obj, fullSchema, joiOpts)
  if (!full.error) {
    let c = new Config(full.value.enabled, full.value.labels, full.value.comments)
    return c
  } else if (opts.throws === true) {
    throw new ConfigError('Invalid Config', full.error)
  }

  const simple = Joi.validate(obj, simpleSchema, joiOpts)
  if (!simple.error) {
    let c = new ConfigSimple(simple.value.comment, simple.value.labels)
    return c
  } else if (opts.throws === true) {
    throw new ConfigError('Invalid Config', simple.error)
  }

  return new Config()
}

module.exports.config = config
module.exports.Types = {
  Config: Config,
  Label: Label,
  ConfigError: ConfigError
}
