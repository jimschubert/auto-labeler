const stripMargin = require('./lib/util/stringHelpers').stripMargin
const config = require('./lib/model/config').config

module.exports = app => {
  app.on('issues.opened', doLabel)
  app.on('pull_request.opened', doLabel)

  async function doLabel (context) {
    if (!context.isBot) {
      const configObj = await context.config('auto-labeler.yml')
      const c = config(configObj)
      // noinspection JSUnresolvedVariable
      const isPr = !!context.payload.pull_request
      const target = isPr ? (c.enabled.prs ? context.payload.pull_request : null) : c.enabled.issues && context.payload.issue

      if (target) {
        let comment = isPr ? c.prComment : c.issueComment
        if ((comment || '').length > 0) {
          // noinspection JSUnresolvedVariable
          comment = stripMargin`${comment}`
        } else {
          comment = stripMargin`
          | Thanks for opening this issue! I have applied any relevant labels.
          `
        }

        const body = `${target.title} ${target.body}`
        let addLabels = new Set()
        if (body.length > 3) {
          for (const v of c.labels) {
            let matches = v.include.some(i => {
              let match = i.test(body)
              i.lastIndex = 0
              return match
            })

            if (matches) {
              let excludes = v.exclude.some(i => {
                let match = i.test(body)
                i.lastIndex = 0
                return match
              })

              if (!excludes) {
                addLabels.add(v.label)
              }
            }
          }
        }

        if (addLabels.size > 0) {
          let params = context.issue({labels: Array.from(addLabels)})
          await context.github.issues.addLabels(params)

          if (comment && comment.length > 0) {
            let issueComment = context.issue({
              body: comment
            })

            return context.github.issues.createComment(issueComment)
          }
        }
      }
    }
  }

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
