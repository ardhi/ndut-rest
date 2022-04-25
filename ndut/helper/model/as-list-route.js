const getColumns = require('../get-columns')
const translateFilter = require('../translate-filter')

module.exports = async function (opts = {}) {
  const { _, getNdutConfig } = this.ndut.helper
  const { alias, schema, swaggerTags, query } = opts
  const config = getNdutConfig('ndut-rest')

  const handler = async function (request, reply) {
    const realAlias = alias ? alias : request.params.model
    const { _ } = this.ndut.helper
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const modelSchema = await getSchemaByAlias(realAlias)
    if (!modelSchema.expose.list) throw this.Boom.notFound('resourceNotFound')
    const { prepList } = this.ndutApi.helper
    const model = await getModelByAlias(realAlias)
    const filter = translateFilter.call(this, request.query)
    const params = await prepList(model, filter)
    if (_.isFunction(query)) params.where = await query.call(this, params.where)
    else params.where = _.merge(params.where, query)
    const columns = getColumns.call(this, request.query.columns)
    const { user, site, rule } = request
    if (['json', 'jsonl'].includes(request.query.export)) {
      const trueJson = request.query.export === 'json'
      const options = { trueJson, columns }
      const stream = await this.ndutApi.helper.exportJsonl({ model, params, filter: { user, site, rule }, options })
      reply.type(trueJson ? 'application/json' : 'text/plain').send(stream)
      return
    }
    if (request.query.export === 'xlsx') {
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', `attachment; filename=${realAlias}.xlsx;`)
      const options = { columns }
      const data = await this.ndutApi.helper.exportXlsx({ model, params, filter: { user, site, rule }, options })
      reply.send(data)
      return
    }
    const options = { columns }
    params.noCount = request.query.nocount
    if (!params.noCount) params.total = await this.ndutApi.helper.count({ model, params, filter: { user, site, rule } })
    return await this.ndutApi.helper.find({ model, params, filter: { user, site, rule }, options })
  }
  const tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get records. Use query string to filter, sort and pagination',
    tags
  }
  return { handler, schema: realSchema }
}