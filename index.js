const scanForRoutes = require('ndut-helper/src/scan-for-routes')
const swaggerDef = require('./swagger-def')
const { concat, isFunction } = require('lodash')

const plugin = async (fastify, options = {}) => {
  const { config } = fastify

  fastify.register(require('fastify-swagger'), options.swagger || swaggerDef)

  let scanDirs = [{ dir: config.dir.rest, options: { root: 'cwd' } }]
  scanDirs = concat(scanDirs, options.scan || [])

  let routes = []
  for (const s of scanDirs) {
    routes = concat(routes, await scanForRoutes({ fastify, dir: s.dir, options: s.options }))
  }

  for (const r of routes) {
    let module = require(r.file)
    if (isFunction(module)) module = await module(fastify)
    module.url = r.url
    module.method = r.method
    fastify.route(module)
  }

  fastify.setErrorHandler((error, request, reply) => {
    if (error && error.isBoom) {
      reply
        .code(error.output.statusCode)
        .type('application/json')
        .headers(error.output.headers)
        .send(error.output.payload)
      return
    }
    reply.send(error || new Error(`Error: ${error}`))
  })
}

module.exports = async function ({ fastify }) {
  const { config } = fastify
  config.dir.rest = config.dir.rest || './rest'
  config.prefix.rest = config.prefix.rest || '/rest'
  config.prefix.restDoc = config.prefix.restDoc || '/doc'
  return { plugin, pluginOptions: { prefix: config.prefix.rest } }
}
