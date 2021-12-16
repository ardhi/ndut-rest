module.exports = function () {
  const { config } = this
  this.setErrorHandler((error, request, reply) => {
    if (!error.isBoom) error = this.Boom.boomify(error)
    if (config.debug) error.output.payload.message = error.message
    error.output.payload.success = false
    if (error.data) error.output.payload.details = error.data
    reply
      .code(error.output.statusCode)
      .type('application/json')
      .headers(error.output.headers)
      .send(error.output.payload)
  })

  this.setNotFoundHandler({
    preHandler: this.rateLimit ? this.rateLimit () : undefined
  }, (request, reply) => {
    throw new this.Boom.Boom('Resource not found', { statusCode: 404 })
  })
}
