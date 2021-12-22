module.exports = {
  routePrefix: '/restdoc',
  openapi: {
    info: {
      title: 'Ndut REST Api'
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
