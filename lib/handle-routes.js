const { _, fs, scanForRoutes, fastGlob } = require('ndut-helper')
const path = require('path')

module.exports = async function (fastify, options) {
  const { config } = fastify
  let scanDirs = [{ dir: options.restDir, options: { root: 'cwd' } }]
  scanDirs = _.concat(scanDirs, options.scan || [])

  const decorators = ['main', 'reply', 'request']
  let hookFiles = []
  for (const n of config.nduts) {
    scanDirs = _.concat(scanDirs, [
      { dir: `${n.dir}/ndutRest/route`, options: { prefix: n.prefix } },
    ])
    for (const d of decorators) {
      const file = `${n.dir}/ndutRest/decorator/${d}.js`
      if (fs.existsSync(file)) {
        let mod = require(file)
        if (_.isFunction(mod)) mod = mod(fastify)
        _.forOwn(mod, (v, k) => {
          fastify['decorate' + (d === 'main' ? '' : _.upperFirst(d))](k, v)
        })
      }
    }
    hookFiles = _.concat(hookFiles, await fastGlob(`${n.dir}/ndutRest/hook/*.js`))
  }
  if (hookFiles.length > 0) {
    for (const f of hookFiles) {
      const method = _.camelCase(path.basename(f, '.js'))
      fastify.addHook(method, require(f))
    }
  }
  fastify.addHook('preSerialization', async (request, reply, payload = {}) => {
    if (!_.has(payload, 'error')) {
      payload = _.has(payload, 'data') ? payload : { data: payload }
      payload.success = true
    }
    const output = {}
    _.forOwn(payload, (v, k) => {
      if (_.has(options.resultKey, k)) output[options.resultKey[k]] = v
      else if (_.has(options.queryKey, k)) output[options.queryKey[k]] = v
      else output[k] = v
    })
    return output
  })
  let routes = []
  for (const s of scanDirs) {
    routes = _.concat(routes, await scanForRoutes(fastify, s.dir, s.options ))
  }

  for (const r of routes) {
    let module = require(r.file)
    if (_.isFunction(module)) module = await module(fastify)
    fastify.log.debug(`+ Route [${r.method}] ${options.prefix}${r.url}`)
    module.url = r.url
    module.method = r.method
    fastify.route(module)
  }
}
