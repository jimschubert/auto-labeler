const Joi = require('joi')

module.exports = Joi.object().keys({
  enable: Joi.object().keys({
    issues: Joi.boolean().required(),
    prs: Joi.boolean().required()
  }).required(),
  comments: Joi.object().keys({
    issues: Joi.string().min(0).required(),
    prs: Joi.string().min(0).required()
  }).required(),
  labels: Joi.object().pattern(/./,
    Joi.object().keys({
      include: Joi.array().items(Joi.string().min(1)).required(),
      exclude: Joi.array().items(Joi.string().min(1))
    })
  )
})
