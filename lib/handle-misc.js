module.exports = function (fastify) {
  const { config } = fastify
  fastify.setErrorHandler((error, request, reply) => {
    if (!error.isBoom) error = fastify.Boom.boomify(error)
    if (config.debug) error.output.payload.message = error.message
    error.output.payload.success = false
    if (error.data) error.output.payload.errors = error.data
    reply
      .code(error.output.statusCode)
      .type('application/json')
      .headers(error.output.headers)
      .send(error.output.payload)
  })

  fastify.setNotFoundHandler({
    preHandler: fastify.rateLimit ? fastify.rateLimit () : undefined
  }, (request, reply) => {
    throw new Boom.Boom('Resource not found', { statusCode: 404 })
  })
}
