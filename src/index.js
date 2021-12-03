const { _, scanForRoutes } = require('ndut-helper')
const swaggerDef = require('./swagger-def')

const plugin = async (fastify, options = {}) => {
  const { config } = fastify

  fastify.register(require('fastify-swagger'), options.swagger || swaggerDef)

  let scanDirs = [{ dir: config.dir.rest, options: { root: 'cwd' } }]
  scanDirs = _.concat(scanDirs, options.scan || [])

  for (const n of config.nduts) {
    scanDirs = _.concat(scanDirs, [
      { dir: n.dir + '/rest' },
      { dir: n.dir + '/src/rest' }
    ])
  }

  let routes = []
  for (const s of scanDirs) {
    routes = _.concat(routes, await scanForRoutes(fastify, s.dir, s.options ))
  }

  for (const r of routes) {
    let module = require(r.file)
    if (_.isFunction(module)) module = await module(fastify)
    fastify.log.debug(`- Route [${r.method}] ${r.url}`)
    module.url = r.url
    module.method = r.method
    fastify.route(module)
  }

  fastify.setErrorHandler((error, request, reply) => {
    if (!error.isBoom) error = fastify.Boom.boomify(error)
    reply
      .code(error.output.statusCode)
      .type('application/json')
      .headers(error.output.headers)
      .send(error.output.payload)
  })

  fastify.setNotFoundHandler({
    preHandler: fastify.rateLimit ? fastify.rateLimit () : undefined
  }, (request, reply) => {
    throw new fastify.Boom.Boom('Resource not found', { statusCode: 404 })
  })
}

module.exports = async function (fastify) {
  fastify.log.info('Initialize "ndut-rest"')
  const { config } = fastify
  config.dir.rest = config.dir.rest || './rest'
  config.prefix.rest = config.prefix.rest || '/rest'
  config.prefix.restDoc = config.prefix.restDoc || '/doc'
  return { plugin, options: { prefix: config.prefix.rest } }
}
