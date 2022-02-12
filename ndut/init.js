const handleSwagger = require('../lib/handle-swagger')

module.exports = async function (options) {
  await handleSwagger.call(this, options)
}
