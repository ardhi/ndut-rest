module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, schemaTags } = opts
  const { asOpenApiProperties } = this.ndutDb.helper
  const properties = await asOpenApiProperties(opts.alias)
  const handler = async function (request, reply) {
    const { getModelByAlias, getSchemaByAlias } = this.ndutDb.helper
    const { _ } = this.ndut.helper
    const realAlias = alias ? alias : request.params.model
    const schema = await getSchemaByAlias(realAlias)
    if (!schema.expose.create) throw this.Boom.notFound('Resource not found')
    const model = await getModelByAlias(realAlias)
    return await this.ndutApi.helper.create(model, {}, request.body)
  }
  const realSchema = _.cloneDeep(schema) || {
    description: 'Create and persist records',
    tags: [schemaTags || 'General'],
    body: {
      type: 'object'
      // properties
    }
  }
  return { handler, schema: realSchema }
}