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
    const { _ } = this.ndut.helper
    const id = request.params.id
    const model = await getModelByAlias(realAlias)
    const existing = await this.ndutDb.findById(model, request, id)
    if (!existing) throw this.Boom.notFound('Record not found')
    await this.ndutDb.update(model, request, { id }, _.omit(request.body, 'id'))
    const data = await this.ndutDb.findById(model, request, id)
    return {
      data,
      message: 'Record successfully updated'
    }
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
