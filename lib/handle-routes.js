const path = require('path')
const handleModel = require('./handle-model')

const customBuilder = async function (scope, prefix, routeInfo = {}) {
  if (routeInfo.type === 'modelAsRest') await handleModel(scope, prefix, routeInfo)
}

module.exports = async function (options) {
  const { _, getNdutConfig, aneka, iterateNduts } = this.ndut.helper
  const { build } = this.ndutRoute.helper

  let scanDirs = []
  let routes = []
  scanDirs = _.concat(scanDirs, options.scan || [])
  await iterateNduts(async function (cfg) {
    try {
      const result = await aneka.requireBase(`${cfg.dir}/ndutRest/route.js`, this)
      routes = _.concat(routes, result)
    } catch (err) {}
  })
  await build(this, { name: 'ndutRest', scanDirs, routes, prefix: options.prefix, notFoundMsg: 'resourceNotFound', customBuilder })

  this.addHook('preSerialization', async (request, reply, payload = {}) => {
    const restConfig = getNdutConfig('ndut-rest')
    const except = [`/${restConfig.prefix}${restConfig.prefixDoc}`]
    let isMatch = false
    if (request.routerPath) {
      _.each(except, e => {
        if (request.routerPath.startsWith(e)) {
          isMatch = true
          return false
        }
      })
    }
    if (!_.has(payload, 'error') && !isMatch) {
      payload = _.has(payload, 'data') ? payload : { data: payload }
      payload.success = true
      if (payload.message && request.i18n) payload.message = request.i18n.t(payload.message, { ns: 'rest' })
    }
    const output = {}
    _.forOwn(payload, (v, k) => {
      if (_.isPlainObject(v)) delete v.ndut
      if (_.has(options.resultKey, k)) output[options.resultKey[k]] = v
      else if (_.has(options.queryKey, k)) output[options.queryKey[k]] = v
      else output[k] = v
    })
    delete output.ndut
    return output
  })
}
