module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, schemaTags } = opts
  const handler = async function (request, reply) {
    const realAlias = alias ? alias : request.params.model
    const { getSchemaByAlias } = this.ndutDb.helper
    const schema = getSchemaByAlias(realAlias)
    if (!schema.expose.list) throw this.Boom.notFound('Resource not found')
    const { parseQsForList } = this.ndutRest.helper
    const model = this.ndutDb.helper.getModelByAlias(realAlias)
    const { limit, page, skip, order, where } = parseQsForList(request, model)
    const total = await this.ndutDb.count(model, request, where)
    const data = await this.ndutDb.find(model, request, { limit, order, skip, where })
    return {
      data,
      total,
      totalPage: Math.floor((total + limit - 1) / limit),
      pageSize: limit,
      page
    }
  }
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get records. Use query string to filter, sort and pagination',
    tags: [schemaTags || 'General']
  }
  return { handler, schema: realSchema }
}