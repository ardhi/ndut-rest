module.exports = {
  routePrefix: '/apidoc',
  swagger: {
    info: {
      title: 'Rappopo BOS Rest',
      description: 'Rest API Documentation for Rappopo BOS Ecosystem',
      version: '0.0.1'
    },
    externalDocs: {
      url: 'https://rappopo.com/bos/rest',
      description: 'more'
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'DB', description: 'DB Collection related end-points' }
    ],
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
