module.exports = async function (opts = {}) {
  const { _, getNdutConfig } = this.ndut.helper
  const { alias, schema, schemaTags } = opts
  const config = await getNdutConfig('ndut-rest')
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
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const schema = await getSchemaByAlias(realAlias)
    if (!schema.expose.list) throw this.Boom.notFound('Resource not found')
    const { prepList } = this.ndutApi.helper
    const model = await getModelByAlias(realAlias)
    const filter = translateFilter(request.query)
    const { limit, page, skip, order, where } = await prepList(model, filter)
    const total = await this.ndutApi.helper.count(model, where)
    return await this.ndutApi.helper.find(model, { limit, order, skip, where, total, page })
  }
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get records. Use query string to filter, sort and pagination',
    tags: [schemaTags || 'General']
  }
  return { handler, schema: realSchema }
}