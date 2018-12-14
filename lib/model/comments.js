class Comments {
  constructor (issues, prs) {
    this.issues = issues || ''
    this.prs = prs || ''
  }
}

const defaultComments = new Comments('', '')

module.exports.Comments = Comments
module.exports.defaultComments = defaultComments
