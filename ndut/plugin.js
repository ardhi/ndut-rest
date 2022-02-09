const handleMisc = require('../lib/handle-misc')
const handleRoutes = require('../lib/handle-routes')
const handleSwagger = require('../lib/handle-swagger')

module.exports = async function (scope, options) {
  const { getConfig } = scope.ndut.helper
  const config = getConfig()
  if (config.httpServer.disabled) {
    scope.log.warn('HTTP server is disabled, route generation canceled')
    return
  }
  await handleSwagger.call(scope, options)
  await handleRoutes.call(scope, options)
  await handleMisc.call(scope)
}
