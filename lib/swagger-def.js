module.exports = {
  routePrefix: '/restdoc',
  openapi: {
    info: {
      title: 'Ndut REST Api',
      description: 'Rest API Documentation for Ndut Framework',
      version: '0.0.1'
    },
    components: {
      securitySchemes: {
      }
    },
    security: [
    ]
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
