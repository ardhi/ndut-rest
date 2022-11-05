const getColumns = require('../get-columns')

module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, swaggerTags, data } = opts
  const { asOpenApiProperties } = this.ndutDb.helper
  const properties = await asOpenApiProperties(opts.alias)
  const handler = async function (request, reply) {
    const { getModelByAlias, getSchemaByAlias } = this.ndutDb.helper
    const realAlias = alias ? alias : request.params.model
    const modelSchema = await getSchemaByAlias(realAlias)
    if (!modelSchema.expose.create) throw this.Boom.notFound('resourceNotFound')
    const model = await getModelByAlias(realAlias)
    const filter = this.ndutRest.helper.buildFilter(request)
    let body = _.cloneDeep(request.body)
    if (_.isFunction(data)) body = await query.call(this, data, request)
    else body = _.merge(body, data)

    const options = { reqId: request.id, columns: getColumns.call(this, request.query.columns), uploadInfo: request.query.uploadInfo, request }
    return await this.ndutApi.helper.create({ model, body, filter, options })
  }
  let tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Create and persist records',
    tags,
    body: {
      type: 'object'
      // properties
    }
  }
  return { handler, schema: realSchema }
}