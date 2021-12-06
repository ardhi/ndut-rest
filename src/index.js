const mod = require('ndut-helper')
const { _, scanForRoutes } = require('ndut-helper')
const swaggerDef = require('./swagger-def')

const plugin = async (fastify, options = {}) => {
  const { config } = fastify
  let scanDirs = [{ dir: options.restDir, options: { root: 'cwd' } }]
  scanDirs = _.concat(scanDirs, options.scan || [])

  for (const n of config.nduts) {
    scanDirs = _.concat(scanDirs, [
      { dir: n.dir + '/ndutRest', options: { prefix: n.prefix } },
      { dir: n.dir + '/src/ndutRest', options: { prefix: n.prefix } }
    ])
  }

  let routes = []
  for (const s of scanDirs) {
    routes = _.concat(routes, await scanForRoutes(fastify, s.dir, s.options ))
  }

  if (options.swagger !== false) {
    fastify.log.debug('+ RestDoc')
    const swaggerConf = options.swagger || swaggerDef
    swaggerConf.routePrefix = options.prefixDoc
    fastify.register(require('fastify-swagger'), swaggerConf)
  } else {
    fastify.log.debug('- RestDoc')
  }

  for (const r of routes) {
    let module = require(r.file)
    if (_.isFunction(module)) module = await module(fastify)
    fastify.log.debug(`+ Route [${r.method}] ${options.prefix}${r.url}`)
    module.url = r.url
    module.method = r.method
    fastify.route(module)
  }

  fastify.setErrorHandler((error, request, reply) => {
    if (!error.isBoom) error = fastify.Boom.boomify(error)
    if (config.debug) error.output.payload.message = error.message
    error.output.payload.success = false
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
  const { config } = fastify
  const ndutConfig = _.find(config.nduts, { name: 'ndut-rest' }) || {}
  ndutConfig.restDir = ndutConfig.restDir || './rest'
  ndutConfig.prefix = ndutConfig.prefix || '/rest'
  ndutConfig.prefixDoc = ndutConfig.prefixDoc || '/documentation'
  ndutConfig.queryKey = {
    pageSize: 'pageSize',
    page: 'page',
    offset: 'offset',
    sort: 'sort',
    query: 'q'
  }
  ndutConfig.resultKey = {
    success: 'success',
    data: 'data',
    message: 'message',
    total: 'total',
    totalPage: 'totalPage'
  }
  ndutConfig.maxPageSize = 100

  return { plugin, options: ndutConfig }
}
