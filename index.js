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
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('issues.opened', async context => {
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

      app.log(config)
      app.log(labels)

      if (config && config.comment) {
        comment = stripMargin`${config.comment}`
      } else {
        comment = stripMargin`
          | Thanks for opening this issue! I have applied any relevant labels.
          `
      }

      const body = context.payload.issue.body
      let found = false
      if (body != null && body.length > 0) {
        for (const v of labels) {
          // app.log(`Evaluating ${body} for ${v}…`)
          if (v.match.test(body)) {
            // app.log(`Yes! ${body} matches ${v.match}`)
            let params = context.issue({labels: [v.label]})
            await context.github.issues.addLabels(params)
            found = true
          }
        }
      }

      if (found && comment && comment.length > 0) {
        let issueComment = context.issue({
          body: comment
        })

        return context.github.issues.createComment(issueComment)
      }
    }
  })

  app.on(`*`, async context => {
    context.log({event: context.event, action: context.payload.action})
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
