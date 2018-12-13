const Joi = require('joi')

module.exports = Joi.object().keys({
  enable: Joi.object().keys({
    issues: Joi.boolean().required().description('Enable on issues.'),
    prs: Joi.boolean().required().description('Enable on prs.')
  }).required().description('Whether or not to enable on issues and/or prs.'),
  comments: Joi.object().keys({
    issues: Joi.string().min(0).required().description('Issue-only comment.'),
    prs: Joi.string().min(0).required().description('PR-only comment.')
  }).required().description('The comments to use for issues and prs.'),
  labels: Joi.object().pattern(/./,
    Joi.object().keys({
      include: Joi.array().items(Joi.string().min(1)).required(),
      exclude: Joi.array().items(Joi.string().min(1))
    }).description('Labeling rules.')
  )
})
