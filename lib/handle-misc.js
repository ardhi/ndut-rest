module.exports = async function () {
  const { _, boom } = this.ndut.helper
  this.setErrorHandler((error, request, reply) => {
    error = boom(error)
    this.ndut.helper.dumpError(error)
    error.output.payload.success = false
    const options = { error }
    if (error.data) {
      const details = _.omit(error.data, ['ndut'])
      if (!_.isEmpty(details)) error.output.payload.details = details
    }
    reply
      .code(error.output.statusCode)
      .type('application/json')
      .headers(error.output.headers)
      .t(error.output.payload, options)
  })

  this.setNotFoundHandler({
    preHandler: this.rateLimit ? this.rateLimit () : undefined
  }, (request, reply) => {
    throw this.Boom.notFound('resourceNotFound', { statusCode: 404 })
  })
}
