module.exports = async function () {
  const { _ } = this.ndut.helper
  this.setErrorHandler((error, request, reply) => {
    if (!error.isBoom) error = this.Boom.boomify(error)
    error.output.payload.success = false
    const options = { error }
    if (error.data) {
      if (error.data.ndut) options.ns = error.data.ndut
      error.output.payload.details = _.omit(error.data, ['ndut'])
    }
    reply
      .code(error.output.statusCode)
      .type('application/json')
      .headers(error.output.headers)
      .t(error.output.payload, options)
    this.ndut.helper.dumpError(error)
  })

  this.setNotFoundHandler({
    preHandler: this.rateLimit ? this.rateLimit () : undefined
  }, (request, reply) => {
    throw new this.Boom.Boom('resourceNotFound', { statusCode: 404 })
  })
}
