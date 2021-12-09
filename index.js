const { _, fs, fastGlob, scanForRoutes } = require('ndut-helper')
const handleMisc = require('./lib/handle-misc')
const handleRoutes = require('./lib/handle-routes')
const handleSwagger = require('./lib/handle-swagger')

const plugin = async (fastify, options = {}) => {
  handleSwagger(fastify, options)
  await handleRoutes(fastify, options)
  handleMisc(fastify)
}

module.exports = async function (fastify) {
  const { config } = fastify
  const name = 'ndut-rest'
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

  return { name, plugin, options: ndutConfig }
}
