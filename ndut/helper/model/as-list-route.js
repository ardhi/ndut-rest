module.exports = async function (opts = {}) {
  const { _, getNdutConfig } = this.ndut.helper
  const { alias, schema, swaggerTags, query } = opts
  const config = getNdutConfig('ndut-rest')
  const invQueryKey = _.invert(config.queryKey)

  const translateFilter = item => {
    const result = {}
    _.forOwn(item, (v, k) => {
      if (_.has(invQueryKey, k)) result[invQueryKey[k]] = v
      else result[k] = v
    })
    return result
  }

  const handler = async function (request, reply) {
    const realAlias = alias ? alias : request.params.model
    const { _ } = this.ndut.helper
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const modelSchema = await getSchemaByAlias(realAlias)
    if (!modelSchema.expose.list) throw this.Boom.notFound('resourceNotFound')
    const { prepList } = this.ndutApi.helper
    const model = await getModelByAlias(realAlias)
    const filter = translateFilter(request.query)
    let columns = _.without(_.map((request.query.columns || '').split(','), c => _.trim(c)), '', null, undefined)
    columns = _.map(columns, c => {
      const [value, label] = _.map(c.split(':'), item => _.trim(item))
      return { value, label: label || value }
    })
    const params = await prepList(model, filter)
    if (_.isFunction(query)) params.where = await query.call(this, params.where)
    else params.where = _.merge(params.where, query)

    const { user, site, rule } = request
    if (['json', 'jsonl'].includes(request.query.export)) {
      const trueJson = request.query.export === 'json'
      const stream = await this.ndutApi.helper.exportJsonl({ model, params, filter: { user, site, rule }, columns, options: { trueJson } })
      reply.type(trueJson ? 'application/json' : 'text/plain').send(stream)
      return
    }
    if (request.query.export === 'xlsx') {
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', `attachment; filename=${realAlias}.xlsx;`)
      const data = await this.ndutApi.helper.exportXlsx({ model, params, filter: { user, site, rule }, columns })
      reply.send(data)
      return
    }
    params.noCount = request.query.nocount
    if (!params.noCount) params.total = await this.ndutApi.helper.count({ model, params, filter: { user, site, rule } })
    return await this.ndutApi.helper.find({ model, params, filter: { user, site, rule }, columns })
  }
  const tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get records. Use query string to filter, sort and pagination',
    tags
  }
  return { handler, schema: realSchema }
}