class Comments {
  constructor (issues, prs) {
    this.issues = issues || true
    this.prs = prs || true
  }
}

const defaultComments = new Comments('', '')

module.exports.Comments = Comments
module.exports.defaultComments = defaultComments
