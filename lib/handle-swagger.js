const swaggerDef = require('./swagger-def')

module.exports = function (fastify, options) {
  const { _, getNdutConfig } = fastify.ndut.helper
  if (options.swagger !== false) {
    fastify.log.debug('+ RestDoc')
    const swaggerConf = options.swagger || swaggerDef
    swaggerConf.routePrefix = options.prefixDoc
    fastify.register(require('fastify-swagger'), swaggerConf)
    const authConfig = getNdutConfig(fastify, 'ndut-auth')
    if (_.get(authConfig, 'strategy.basic'))
      _.set(swaggerConf, 'openapi.components.securitySchemes.BasicAuth', { type: 'http', scheme: 'basic' })
      swaggerConf.openapi.security.push({ BasicAuth: [] })
    if (_.get(authConfig, 'strategy.apiKey')) {
      _.set(swaggerConf, 'openapi.components.securitySchemes.BearerAuth', { type: 'http', scheme: 'bearer' })
      swaggerConf.openapi.security.push({ BearerAuth: [] })
      _.set(swaggerConf, 'openapi.components.securitySchemes.ApiKeyAuth', { type: 'apiKey', in: 'query', name: authConfig.apiKeyQueryString })
      swaggerConf.openapi.security.push({ ApiKeyAuth: [] })
    }
  } else {
    fastify.log.debug('- RestDoc')
  }
}
