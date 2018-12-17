// NOTE: This file _must_ be named index.js for zeit.co/now to serve it as expected.
const {createProbot} = require('probot')
const { findPrivateKey } = require('probot/lib/private-key')
const appFn = require('./github')

const loadProbot = appFn => {
  const probot = createProbot({
    id: process.env.APP_ID,
    secret: process.env.WEBHOOK_SECRET,
    cert: findPrivateKey()
  })

  probot.setup([appFn])
  return probot
}

module.exports = (req, res) => {
  const p = loadProbot(appFn)
  return p.server(req, res)
}
