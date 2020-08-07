const Joi = require("@hapi/joi");

module.exports = {
  Schema: Joi.object({
    id: Joi.string().required(),
    metricId: Joi.string().required(),
    accountId: Joi.string().required(),
    date: Joi.date().required(),
    views: Joi.number().required(),
    plays: Joi.number().required(),
    shares: Joi.number().required(),
  }),
};
