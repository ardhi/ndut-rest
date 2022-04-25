const getColumns = require('../get-columns')

module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, swaggerTags, query } = opts
  const handler = async function (request, reply) {
    const realAlias = alias ? alias : request.params.model
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const modelSchema = await getSchemaByAlias(realAlias)
    if (!modelSchema.expose.remove) throw this.Boom.notFound('resourceNotFound')
    const model = await getModelByAlias(realAlias)
    const { user, site } = request
    let params = { id: request.params.id }
    const options = { reqId: request.id, columns: getColumns.call(this, request.query.columns) }
    if (_.isFunction(query)) params = await query.call(this, params)
    else params = _.merge(params, query)
    return await this.ndutApi.helper.remove({ model, params, filter: { user, site }, options })
  }
  const tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Remove record by its ID',
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