const { createProbot } = require('probot')

const appFn = require('./github')
const loadProbot = appFn => {
  const probot = createProbot({
    id: process.env.APP_ID
  })

  probot.load(appFn)

  return probot
}

module.exports = (req, res) => {
  const probot = loadProbot(appFn)
  return probot.server(req, res)
}
