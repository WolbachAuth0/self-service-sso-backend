const { respond, handleError } = require('./../middleware/responseFormatter')

module.exports = {
  heartbeat
}

/**
 * TODO: Should return the JSON of the API specification
 * 
 * @param {*} req Express request object
 * @param {*} res Express response object
 */
function heartbeat (req, res) {
  try {
    const message = `Hello from the API Server!`
    const data = {
      uri: req.url
    }
    respond(req, res).ok({ message, data});
  } catch (error) {
    handleError(req, res, error);
  }
}
