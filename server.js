const express = require('express')
const serveStatic = require('serve-static')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')

// import the env variables FIRST - Before you do anything else
if (process.env.NODE_ENV !== 'production') {
  const environments = [
    path.join(__dirname, './.env'),
    path.join(__dirname, './.env.development')
  ]
  require('dotenv').config({ path: environments, override: true})
}

// Import ErrorHandler
const { globalErrorHandler } = require('./middleware/responseFormatter')
const enforceHTTPS = require('./middleware/enforceHTTPS')
const { routerLogger, errorLogger } = require('./models/Logger')

const app = express()

// middleware ...
app.use(express.json())
app.use(routerLogger)

// TODO: decide if you want a whitelist or just have a global API.
app.use(cors())
app.use(helmet({ contentSecurityPolicy: false }))

// enforce https in production
if(process.env.NODE_ENV === 'production') {
  app.use(enforceHTTPS)
}

// Serve static files from the public directory
app.use('/', serveStatic(path.join(__dirname, './../src/dist')))

// Routes
app.use('/', require('./routes/front'))
app.use('/api', require('./routes/api'))
app.use('/api/v1/connections', require('./routes/connections'))
app.use('/api/v1/organizations', require('./routes/organizations'))

// override express error handler
app.use(globalErrorHandler)
// express-winston errorLogger AFTER the other routes have been defined.
app.use(errorLogger)

module.exports = app
