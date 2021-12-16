const swaggerDef = require('./swagger-def')

module.exports = function (options) {
  const { _, getNdutConfig } = this.ndut.helper
  if (options.swagger !== false) {
    this.log.debug('+ RestDoc')
    const swaggerConf = options.swagger || swaggerDef
    swaggerConf.routePrefix = options.prefixDoc
    _.set(swaggerConf, 'openapi.info.version', options.pkg.version)
    _.set(swaggerConf, 'openapi.info.description', options.pkg.description)
    this.register(require('this-swagger'), swaggerConf)
    const authConfig = getNdutConfig('ndut-auth')
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
    this.log.debug('- RestDoc')
  }
}
