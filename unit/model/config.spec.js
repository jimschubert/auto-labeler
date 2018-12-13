const assert = require('assert')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const config = require('../../lib/model/config.js').config
const Types = require('../../lib/model/config.js').Types

let fixture = (file) => {
  return path.normalize(path.join(__dirname, '..', 'fixtures', file))
}

describe('Config', () => {
  describe('#config(obj)', () => {
    it('should parse a "simple" config object', (done) => {
      let p = fixture('simple.yml')

      let simple = yaml.safeLoad(fs.readFileSync(p))
      let c = config(simple)
      assert.equal(c.enabled.issues, true)
      assert.equal(c.enabled.prs, true)
      assert.ok(c.issueComment.indexOf('Thanks for the contribution!') > -1)
      assert.ok(c.prComment.indexOf('Thanks for the contribution!') > -1)

      let bug = c.labels.find(l => l.label === 'bug')
      assert.ok(bug)
      assert.equal(bug.include.length, 1)
      assert.equal(bug.exclude.length, 0)

      let helpWanted = c.labels.find(l => l.label === 'help wanted')
      assert.ok(helpWanted)
      assert.equal(helpWanted.include.length, 2)
      assert.equal(helpWanted.exclude.length, 0)

      let enhancement = c.labels.find(l => l.label === 'enhancement')
      assert.ok(enhancement)
      assert.equal(enhancement.include.length, 1)
      assert.equal(enhancement.exclude.length, 0)
      assert.equal(String(enhancement.include[0]), String(/\bfeat\b/g))
      done()
    })

    it('should parse a "full" config object', () => {
      let p = fixture('full.yml')

      let full = yaml.safeLoad(fs.readFileSync(p))
      let c = config(full)
      assert.equal(c.enabled.issues, true)
      assert.equal(c.enabled.prs, true)
      assert.ok(c.comments.issues.indexOf('Thanks for opening this issue!') > -1)
      assert.ok(c.comments.prs.indexOf('Thanks for the contribution!') > -1)

      let bug = c.labels.find(l => l.label === 'bug')
      assert.ok(bug)
      assert.equal(bug.include.length, 1)
      assert.equal(bug.exclude.length, 0)

      let helpWanted = c.labels.find(l => l.label === 'help wanted')
      assert.ok(helpWanted)
      assert.equal(helpWanted.include.length, 2)
      assert.equal(helpWanted.exclude.length, 1)
      assert.equal(String(helpWanted.exclude[0]), String(/\b\[asdf\]\b/g))

      let enhancement = c.labels.find(l => l.label === 'enhancement')
      assert.ok(enhancement)
      assert.equal(enhancement.include.length, 1)
      assert.equal(enhancement.exclude.length, 0)
      assert.equal(String(enhancement.include[0]), String(/\bfeat\b/g))
    })

    it('should expose a "full" schema error object via "throws=true" option', () => {
      let p = fixture('full.bad.yml')
      let full = yaml.safeLoad(fs.readFileSync(p))
      assert.throws(() => {
        config(full, { throws: true })
      }, function (err) {
        if ((err instanceof Types.ConfigError) && err.message === 'Invalid Config') {
          return true
        }
      })
    })
  })
})
