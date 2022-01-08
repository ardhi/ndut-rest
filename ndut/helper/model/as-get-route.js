module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, schemaTags } = opts
  const handler = async function (request, reply) {
    const realAlias = alias ? alias : request.params.model
    const { getSchemaByAlias } = this.ndutDb.helper
    const schema = getSchemaByAlias(realAlias)
    if (!schema.expose.get) throw this.Boom.notFound('Resource not found')
    const model = this.ndutDb.helper.getModelByAlias(realAlias)
    const data = await this.ndutDb.findById(model, request, request.params.id)
    if (!data) throw this.Boom.notFound('Record not found')
    return {
      data
    }
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

