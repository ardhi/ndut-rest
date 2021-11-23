module.exports = {
  routePrefix: '/apidoc',
  swagger: {
    info: {
      title: 'Ndut REST Api',
      description: 'Rest API Documentation for Ndut Framework',
      version: '0.0.1'
    },
    externalDocs: {
      url: 'https://github.com/ardhi/ndut',
      description: 'more'
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      apiKey: {
        type: 'apiKey',
        name: 'apiKey',
        in: 'header'
      }
    }
  },
  uiConfig: {
    // docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  exposeRoute: true,
  hideUntagged: true
}
