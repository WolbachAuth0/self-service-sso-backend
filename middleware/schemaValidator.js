const { respond } = require('./../middleware/responseFormatter')
const Validator = require('jsonschema').Validator
const validator = new Validator()

module.exports = function (schema) {
  return function (req, res, next) {
    const validation = validator.validate(req.body, schema)
    if (validation.valid) {
      next()
    } else {
      const message = 'Request body does not match schema'
      const data = validation
      respond(req, res).badRequest({ message, data});
    }
  }
}

