const handleMisc = require('../lib/handle-misc')
const handleRoutes = require('../lib/handle-routes')
const handlePing = require('../lib/handle-ping')

module.exports = async function (scope, options) {
  const { getConfig } = scope.ndut.helper
  const config = getConfig()
  if (config.httpServer.disabled) {
    scope.log.warn('HTTP server is disabled, route generation canceled')
    return
  }
  await handleRoutes.call(scope, options)
  await handlePing.call(scope)
  await handleMisc.call(scope)
}
