const model = {
  comments: require('./model/comments'),
  config: require('./model/config'),
  label: require('./model/label')
}

const schema = require('./schema')

let main = model.config.config
main.model = model
main.schema = schema

module.exports = main
