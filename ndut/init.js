const swaggerDef = require('../lib/swagger-def')

module.exports = async function () {
  const { _, getNdutConfig } = this.ndut.helper
  const options = await getNdutConfig('ndut-rest')
  if (options.swagger !== false) {
    this.log.debug('* RestDoc')
    _.set(swaggerDef, 'openapi.info.version', options.pkg.version)
    _.set(swaggerDef, 'openapi.info.description', options.pkg.description)
    const swaggerConf = options.swagger || swaggerDef
    swaggerConf.routePrefix = options.prefixDoc
    this.register(require('fastify-swagger'), swaggerConf)
    const authConfig = await getNdutConfig('ndut-auth')
    if (_.get(authConfig, 'strategy.basic'))
      _.set(swaggerConf, 'openapi.components.securitySchemes.BasicAuth', { type: 'http', scheme: 'basic' })
      swaggerConf.openapi.security.push({ BasicAuth: [] })
    if (_.get(authConfig, 'strategy.apiKey')) {
      _.set(swaggerConf, 'openapi.components.securitySchemes.BearerAuth', { type: 'http', scheme: 'bearer' })
      swaggerConf.openapi.security.push({ BearerAuth: [] })
      _.set(swaggerConf, 'openapi.components.securitySchemes.ApiKeyAuth', { type: 'apiKey', in: 'query', name: authConfig.apiKeyQueryString })
      swaggerConf.openapi.security.push({ ApiKeyAuth: [] })
    }
  }
}
