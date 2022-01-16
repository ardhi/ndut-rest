const handleMisc = require('../lib/handle-misc')
const handleRoutes = require('../lib/handle-routes')

module.exports = async function (scope, options) {
  await handleRoutes.call(scope, options)
  await handleMisc.call(scope)
}
