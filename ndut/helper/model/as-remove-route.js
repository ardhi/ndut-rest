module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, schemaTags } = opts
  const handler = async function (request, reply) {
    const realAlias = alias ? alias : request.params.model
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const schema = await getSchemaByAlias(realAlias)
    if (!schema.expose.remove) throw this.Boom.notFound('Resource not found')
    const model = await getModelByAlias(realAlias)
    const existing = await this.ndutDb.findById(model, request, request.params.id)
    if (!existing) throw this.Boom.notFound('Record not found')
    await this.ndutDb.remove(model, request, { id: request.params.id }, existing)
    return {
      data: existing,
      message: 'Record successfully removed'
    }
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