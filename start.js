const server = require('./server')
const { logger } = require('./models/Logger')

startup(server)

async function startup(server) {
  
  logger.info(`loaded environment variables from ${process.env.NODE_ENV} settings.`)
  logger.info(`starting server in ${process.env.NODE_ENV} mode.`)

  startServer()
}

function startServer () {
	// serve the api on the same port as the front-end in production, but on a different port in development.
  const port = process.env.NODE_ENV === 'development' ? process.env.PORT : 8080
  server.listen(port, () => {
    logger.info(`application is listening on port: ${port}`)
  })
}
