module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, schemaTags } = opts
  const { asOpenApiProperties } = this.ndutDb.helper
  const properties = await asOpenApiProperties(opts.alias)
  const handler = async function (request, reply) {
    const realAlias = alias ? alias : request.params.model
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const schema = await getSchemaByAlias(realAlias)
    if (!schema.expose.update) throw this.Boom.notFound('Resource not found')
    const model = await getModelByAlias(realAlias)
    const { user, site, body } = request
    delete body.id
    const params = { id: request.params.id }
    return await this.ndutApi.helper.update({ model, params, body, filter: { user, site } })
  }
  const realSchema = _.cloneDeep(schema) || {
    description: 'Update record by its ID',
    tags: [schemaTags || 'General'],
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
