const handleMisc = require('../lib/handle-misc')
const handleRoutes = require('../lib/handle-routes')

module.exports = async function (scope, options) {
  const { getConfig } = scope.ndut.helper
  const config = getConfig()
  if (config.httpServer.disabled) {
    scope.log.warn('HTTP server is disabled, route generation canceled')
    return
  }
  await handleRoutes.call(scope, options)
  await handleMisc.call(scope)
}
