module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, schemaTags } = opts
  const handler = async function (request, reply) {
    const realAlias = alias ? alias : request.params.model
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const schema = await getSchemaByAlias(realAlias)
    if (!schema.expose.remove) throw this.Boom.notFound('Resource not found')
    const model = await getModelByAlias(realAlias)
    const { user, site } = request
    const params = { id: request.params.id }
    return await this.ndutApi.helper.remove({ model, params, filter: { user, site } })
  }
  const realSchema = _.cloneDeep(schema) || {
    description: 'Remove record by its ID',
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