const getColumns = require('../get-columns')

module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, swaggerTags, query } = opts
  const { asOpenApiProperties } = this.ndutDb.helper
  const properties = await asOpenApiProperties(opts.alias)
  const handler = async function (request, reply) {
    const { getNdutConfig } = this.ndut.helper
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const cfg = getNdutConfig('ndutApi')
    const realAlias = alias ? alias : request.params.model
    const modelSchema = await getSchemaByAlias(realAlias)
    if (!modelSchema.expose.update) throw this.Boom.notFound('resourceNotFound')
    const body = _.omit(request.body, ['id'])
    const model = await getModelByAlias(realAlias)
    const filter = this.ndutRest.helper.buildFilter(request)
    const replacer = new RegExp(cfg.slashReplacer, 'g')
    let params = { id: request.params.id.replace(replacer, '/') }
    const options = { reqId: request.id, columns: getColumns.call(this, request.query.columns), uploadInfo: request.query.uploadInfo, request }
    if (_.isFunction(query)) await query.call(this, params, request)
    else params = _.merge(params, query)
    return await this.ndutApi.helper.update({ model, params, body, filter, options })
  }
  const tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Update record by its ID',
    tags,
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Record ID'
        }
      }
    },
    body: {
      type: 'object'
      // properties
    }
  }
  return { handler, schema: realSchema }
}
