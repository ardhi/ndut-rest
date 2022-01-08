const path = require('path')
const handleModel = require('./handle-model')

const customBuilder = async function (scope, prefix, routeInfo = {}) {
  if (routeInfo.type === 'modelAsRest') await handleModel(scope, prefix, routeInfo)
}

module.exports = async function (options) {
  const { _, getNdutConfig, buildRoutes, aneka } = this.ndut.helper
  const { config } = this

  let scanDirs = [{ dir: `${config.dir.base}/ndutRest/route` }]
  scanDirs = _.concat(scanDirs, options.scan || [])
  await buildRoutes(this, { name: 'ndutRest', scanDirs, prefix: options.prefix, notFoundMsg: 'Resource not found', customBuilder })

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
    }
    const output = {}
    _.forOwn(payload, (v, k) => {
      if (_.has(options.resultKey, k)) output[options.resultKey[k]] = v
      else if (_.has(options.queryKey, k)) output[options.queryKey[k]] = v
      else output[k] = v
    })
    return output
  })
}
