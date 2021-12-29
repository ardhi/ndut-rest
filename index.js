const handleMisc = require('./lib/handle-misc')
const handleRoutes = require('./lib/handle-routes')
const handleSwagger = require('./lib/handle-swagger')

const plugin = async function (fastify, options) {
  await handleRoutes.call(fastify, options)
  handleMisc.call(fastify)
}

const earlyPlugin = async function (fastify, options) {
  handleSwagger.call(fastify, options)
}

module.exports = async function () {
  const { _, fp } = this.ndut.helper
  const { config } = this
  const name = 'ndut-rest'
  const ndutConfig = _.find(config.nduts, { name: 'ndut-rest' }) || {}
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
    error: 'error',
    statusCode: 'statusCode',
    details: 'details',
    data: 'data',
    message: 'message',
    total: 'total',
    totalPage: 'totalPage'
  }
  ndutConfig.maxPageSize = 100

  return { name, plugin, earlyPlugin: fp(earlyPlugin), options: ndutConfig }
}
