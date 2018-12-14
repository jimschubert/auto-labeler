const nock = require('nock')
const fs = require('fs')
const path = require('path')
// Requiring our app implementation
const myProbotApp = require('../github')
const { Probot } = require('probot')

// Requiring our fixtures
const payload = require('./fixtures/issues.opened')
const issueCreatedBody = { body: 'Thanks for opening this issue!' }

const full = fs.readFileSync(path.join(__dirname, 'fixtures', 'full.yml'), 'utf8')

nock.disableNetConnect()

describe('My Probot app', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({})
    // Load our app into probot
    const app = probot.load(myProbotApp)

    // just return a test token
    app.app = () => 'test'
  })

  test('creates a comment when an issue is opened', async () => {
    // Test that we correctly return a test token
    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'test' })

    nock('https://api.github.com')
      .get('/repos/jimschubert/auto-labeler-tests/contents/.github/auto-labeler.yml')
      .reply(200, {
        type: 'file',
        content: Buffer.from(full).toString('base64')
      })

    // Test that a comment is posted
    nock('https://api.github.com')
      .post('/repos/jimschubert/auto-labeler-tests/issues/1/comments', (body) => {
        expect(body).toMatchObject(issueCreatedBody)
        return true
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: 'issues', payload })
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
