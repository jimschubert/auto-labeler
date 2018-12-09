class LabelMatch {
  constructor (match, label) {
    this.match = match
    this.label = label
  }
}

const defaultLabels = [
  new LabelMatch(/\bhelp(ing)?\b/g, 'help wanted'),
  new LabelMatch(/\bbug[s]?\b/g, 'bug')
]

function stripMargin (template, ...expressions) {
  let result = template.reduce((accumulator, part, i) => {
    return accumulator + expressions[i - 1] + part
  })

  return result.replace(/\r?(\n)\s*\|/g, '$1')
}

module.exports = app => {
  app.on('issues.opened', doLabel)
  app.on('pull_request.opened', doLabel)

  async function doLabel (context) {
    if (!context.isBot) {
      const config = await context.config('auto-labeler.yml')
      let labels = []
      let comment = ''
      if (config && config.labels && Object.keys(config.labels).length > 0) {
        for (const labelName in config.labels) {
          if (config.labels.hasOwnProperty(labelName)) {
            let matchAgainst = config.labels[labelName]
            if (Array.isArray(matchAgainst)) {
              matchAgainst.forEach(regex => {
                // noinspection JSCheckFunctionSignatures
                labels.push(new LabelMatch(new RegExp(regex, 'g'), labelName))
              })
            }
          }
        }
      } else {
        labels = defaultLabels
      }

      // noinspection JSUnresolvedVariable
      if (config && config.comment) {
        // noinspection JSUnresolvedVariable
        comment = stripMargin`${config.comment}`
      } else {
        comment = stripMargin`
          | Thanks for opening this issue! I have applied any relevant labels.
          `
      }

      // noinspection JSUnresolvedVariable
      const target = context.payload.issue || context.payload.pull_request

      const body = `${target.title} ${target.body}`
      let addLabels = new Set()
      if (body.length > 3) {
        for (const v of labels) {
          if (v.match.test(body)) {
            addLabels.add(v.label)
          }
          // reset regex state
          v.match.lastIndex = 0
        }

        if (addLabels.size > 0) {
          let params = context.issue({labels: Array.from(addLabels)})
          await context.github.issues.addLabels(params)
        }
      }

      if (addLabels.size > 0 && comment && comment.length > 0) {
        let issueComment = context.issue({
          body: comment
        })

        return context.github.issues.createComment(issueComment)
      }
    }
  }

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
