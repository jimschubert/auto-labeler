const Joi = require('joi')

module.exports = Joi.object().keys({
  comment: Joi.string().min(1).required(),
  labels: Joi.object().pattern(/./, Joi.array().items(Joi.string().min(1)))
})
