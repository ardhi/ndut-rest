const getColumns = require('../get-columns')

module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, swaggerTags } = opts
  const handler = async function (request, reply) {
    const { getModelByAlias, getSchemaByAlias, query = {} } = this.ndutDb.helper
    const realAlias = alias ? alias : request.params.model
    const modelSchema = await getSchemaByAlias(realAlias)
    if (!modelSchema.expose.get) throw this.Boom.notFound('resourceNotFound')
    const model = await getModelByAlias(realAlias)
    const { user, site } = request
    let where = { id: request.params.id }
    if (_.isFunction(query)) where = await query.call(this, where)
    else where = _.merge(where, query)
    const params = { where }
    const options = { columns: getColumns.call(this, request.query.columns) }
    return await this.ndutApi.helper.findOne({ model, params, filter: { user, site }, options })
  }
  const tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get record by its ID',
    tags,
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Record ID'
        }
      }
    }
  }
  return { handler, schema: realSchema }
}

