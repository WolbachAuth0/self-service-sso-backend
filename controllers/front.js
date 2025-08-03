const { join } = require('path')

module.exports = {
  home,
  login
}

/**
 * TODO: Should return the JSON of the API specification
 * 
 * @param {*} req Express request object
 * @param {*} res Express response object
 */
function home (req, res) {
  res.sendFile(join(__dirname, './../../src/dist/index.html'));
}

/**
 * The login endpoint is necessary to facilitate the organization invitation flow.
 * Redirects user to the auth0 /authorize endpoint.
 * 
 * @param {*} req Express.js request object
 * @param {*} res Express.js response object
 */
function login (req, res) {
  const query = Object.assign(req.query, {
    response_type: 'code',
    client_id: process.env.VITE_AUTH0_CLIENT_ID,
    redirect_uri: `${process.env.VITE_FRONTEND_DOMAIN}`,
    response_mode: 'query'
  })
  const qs = new URLSearchParams(query).toString()
  const to = `https://${process.env.VITE_AUTH0_CUSTOM_DOMAIN}/authorize?${qs}`
  res.redirect(to)
}
