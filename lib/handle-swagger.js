const swaggerDef = require('./swagger-def')

module.exports = function (fastify, options) {
  if (options.swagger !== false) {
    fastify.log.debug('+ RestDoc')
    const swaggerConf = options.swagger || swaggerDef
    swaggerConf.routePrefix = options.prefixDoc
    fastify.register(require('fastify-swagger'), swaggerConf)
  } else {
    fastify.log.debug('- RestDoc')
  }
}
