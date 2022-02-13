module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, swaggerTags } = opts
  const handler = async function (request, reply) {
    const { getModelByAlias, getSchemaByAlias } = this.ndutDb.helper
    const realAlias = alias ? alias : request.params.model
    const schema = await getSchemaByAlias(realAlias)
    if (!schema.expose.get) throw this.Boom.notFound('resourceNotFound')
    const model = await getModelByAlias(realAlias)
    const { user, site } = request
    const params = { where: { id: request.params.id } }
    return await this.ndutApi.helper.findOne({ model, params, filter: { user, site } })
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

