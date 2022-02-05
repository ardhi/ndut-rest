module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, schemaTags } = opts
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
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get record by its ID',
    tags: [schemaTags || 'General'],
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

