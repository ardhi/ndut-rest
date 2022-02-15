module.exports = async function (opts = {}) {
  const { _, getNdutConfig } = this.ndut.helper
  const { alias, schema, swaggerTags } = opts
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
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const schema = await getSchemaByAlias(realAlias)
    if (!schema.expose.list) throw this.Boom.notFound('resourceNotFound')
    const { prepList } = this.ndutApi.helper
    const model = await getModelByAlias(realAlias)
    const filter = translateFilter(request.query)
    const params = await prepList(model, filter)
    const { user, site, rule } = request
    if (request.query.stream) {
      const stream = this.ndutApi.helper.stream({ model, params, filter: { user, site, rule } })
      reply.type('text/plain').send(stream)
      return
    }
    params.noCount = request.query.nocount
    if (!params.noCount) params.total = await this.ndutApi.helper.count({ model, params, filter: { user, site, rule } })
    return await this.ndutApi.helper.find({ model, params, filter: { user, site, rule } })
  }
  const tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get records. Use query string to filter, sort and pagination',
    tags
  }
  return { handler, schema: realSchema }
}